/**
 * WordPress dependencies
 */
import { MenuGroup, MenuItem } from '@wordpress/components';
import { __, sprintf } from '@wordpress/i18n';
import { decodeEntities } from '@wordpress/html-entities';
import { addQueryArgs } from '@wordpress/url';
import { useRegistry } from '@wordpress/data';
import { store as coreStore } from '@wordpress/core-data';

/**
 * Internal dependencies
 */
import useNavigationMenu from '../use-navigation-menu';
import useNavigationEntities from '../use-navigation-entities';
import useCreateNavigationMenu from './use-create-navigation-menu';
import { useEffect, useReducer, useCallback } from '@wordpress/element';
import menuItemsToBlocks from '../menu-items-to-blocks';

function reducer( state, action ) {
	switch ( action.type ) {
		case 'RESOLVED':
			return {
				...state,
				isFetching: false,
				navMenu: action.navMenu,
			};
		case 'ERROR':
			return {
				...state,
				isFetching: false,
				navMenu: null,
			};
		case 'LOADING':
			return {
				...state,
				isFetching: true,
			};
		default:
			throw new Error( `Unexpected action type ${ action.type }` );
	}
}

function useConvertClassicToBlockMenu( clientId ) {
	const createNavigationMenu = useCreateNavigationMenu( clientId );
	const registry = useRegistry();

	const [ state, dispatch ] = useReducer( reducer, {
		navMenu: null,
		isFetching: false,
	} );

	async function convertClassicMenuToBlockMenu( menuId, menuName ) {
		// 1. Get the classic Menu items.
		const menuItemsParameters = {
			menus: menuId,
			per_page: -1,
			context: 'view',
		};

		const classicMenuItems = await registry
			.resolveSelect( coreStore )
			.getMenuItems( menuItemsParameters );

		// 2. Convert the classic items into blocks.
		const { innerBlocks } = menuItemsToBlocks( classicMenuItems );

		// 3. Create the `wp_navigation` Post with the blocks.
		const navigationMenu = await createNavigationMenu(
			menuName,
			innerBlocks
		);

		return navigationMenu;
	}

	const convert = useCallback(
		( menuId, menuName ) => {
			if ( ! menuId || ! menuName ) {
				dispatch( {
					type: 'ERROR',
				} );
			}

			dispatch( {
				type: 'LOADING',
			} );

			convertClassicMenuToBlockMenu( menuId, menuName )
				.then( ( navMenu ) => {
					dispatch( {
						type: 'RESOLVED',
						navMenu,
					} );
				} )
				.catch( () => {
					dispatch( {
						type: 'ERROR',
					} );
				} );
		},
		[ clientId ]
	);

	return {
		convert,
		state,
	};
}

export default function NavigationMenuSelector( {
	clientId,
	onSelect,
	onCreateNew,
	showManageActions = false,
	actionLabel,
} ) {
	/* translators: %s: The name of a menu. */
	const createActionLabel = __( "Create from '%s'" );

	actionLabel = actionLabel || createActionLabel;

	const { menus: classicMenus } = useNavigationEntities();

	const {
		convert,
		state: classicMenuConversionState,
	} = useConvertClassicToBlockMenu( clientId );

	const {
		navigationMenus,
		canUserCreateNavigationMenu,
		canUserUpdateNavigationMenu,
		canSwitchNavigationMenu,
	} = useNavigationMenu();

	// TODO: lift this up into parent component in order that
	useEffect( () => {
		if (
			! classicMenuConversionState?.isFetching &&
			classicMenuConversionState.navMenu
		) {
			onSelect( classicMenuConversionState.navMenu );
		}
	}, [ classicMenuConversionState ] );

	const hasNavigationMenus = !! navigationMenus?.length;
	const hasClassicMenus = !! classicMenus?.length;
	const showNavigationMenus = !! canSwitchNavigationMenu;
	const showClassicMenus = !! canUserCreateNavigationMenu;
	const hasManagePermissions =
		canUserCreateNavigationMenu || canUserUpdateNavigationMenu;
	const showSelectMenus =
		( canSwitchNavigationMenu || canUserCreateNavigationMenu ) &&
		( hasNavigationMenus || hasClassicMenus );

	if ( ! showSelectMenus ) {
		return null;
	}

	return (
		<>
			{ showNavigationMenus && hasNavigationMenus && (
				<MenuGroup label={ __( 'Menus' ) }>
					{ navigationMenus.map( ( menu ) => {
						const label = decodeEntities( menu.title.rendered );
						return (
							<MenuItem
								onClick={ () => {
									onSelect( menu );
								} }
								key={ menu.id }
								aria-label={ sprintf( actionLabel, label ) }
							>
								{ label }
							</MenuItem>
						);
					} ) }
				</MenuGroup>
			) }
			{ showClassicMenus && hasClassicMenus && (
				<MenuGroup label={ __( 'Classic Menus' ) }>
					{ classicMenus.map( ( menu ) => {
						const label = decodeEntities( menu.name );
						return (
							<MenuItem
								onClick={ () => {
									convert( menu.id, menu.name );
								} }
								key={ menu.id }
								aria-label={ sprintf(
									createActionLabel,
									label
								) }
							>
								{ label }
							</MenuItem>
						);
					} ) }
				</MenuGroup>
			) }

			{ showManageActions && hasManagePermissions && (
				<MenuGroup label={ __( 'Tools' ) }>
					{ canUserCreateNavigationMenu && (
						<MenuItem onClick={ onCreateNew }>
							{ __( 'Create new menu' ) }
						</MenuItem>
					) }
					<MenuItem
						href={ addQueryArgs( 'edit.php', {
							post_type: 'wp_navigation',
						} ) }
					>
						{ __( 'Manage menus' ) }
					</MenuItem>
				</MenuGroup>
			) }
		</>
	);
}
