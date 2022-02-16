/**
 * WordPress dependencies
 */
import { MenuGroup, MenuItem } from '@wordpress/components';
import { __, sprintf } from '@wordpress/i18n';
import { decodeEntities } from '@wordpress/html-entities';
import { addQueryArgs } from '@wordpress/url';

/**
 * Internal dependencies
 */
import useNavigationMenu from '../use-navigation-menu';
import useNavigationEntities from '../use-navigation-entities';
import useCreateNavigationMenu from './use-create-navigation-menu';
import apiFetch from '@wordpress/api-fetch';
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

	const [ state, dispatch ] = useReducer( reducer, {
		navMenu: null,
		isFetching: false,
	} );

	async function convertClassicMenuToBlockMenu(
		menuId,
		menuName,
		fetchOptions
	) {
		const endpoint = 'wp/v2/menu-items';

		const args = { context: 'view', per_page: 100, menus: menuId };

		// 1. Get the classic Menu items.
		const classicMenuItems = await apiFetch( {
			path: addQueryArgs( endpoint, args ),
			...fetchOptions,
		} );

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
			// Only make the request if we have an actual URL
			// and the fetching util is available. In some editors
			// there may not be such a util.
			if ( true ) {
				dispatch( {
					type: 'LOADING',
				} );

				const controller = new window.AbortController();

				const signal = controller.signal;

				convertClassicMenuToBlockMenu( menuId, menuName, {
					signal,
				} )
					.then( ( navMenu ) => {
						dispatch( {
							type: 'RESOLVED',
							navMenu,
						} );
					} )
					.catch( () => {
						// Avoid setting state on unmounted component
						if ( ! signal.aborted ) {
							dispatch( {
								type: 'ERROR',
							} );
						}
					} );

				return () => {
					controller.abort();
				};
			}
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

	const { convert, state } = useConvertClassicToBlockMenu( clientId );

	const {
		navigationMenus,
		canUserCreateNavigationMenu,
		canUserUpdateNavigationMenu,
		canSwitchNavigationMenu,
	} = useNavigationMenu();

	useEffect( () => {
		if ( ! state?.isFetching && state.navMenu ) {
			onSelect( state.navMenu );
		}
	}, [ state ] );

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
