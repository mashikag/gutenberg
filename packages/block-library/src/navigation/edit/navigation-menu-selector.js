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
import { useEffect } from '@wordpress/element';
import useConvertClassicToBlockMenu from './use-convert-classic-menu-to-block-menu';

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
