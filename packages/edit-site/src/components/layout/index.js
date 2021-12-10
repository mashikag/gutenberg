/**
 * WordPress dependencies
 */
import { useEffect } from '@wordpress/element';
import { useSelect } from '@wordpress/data';
import { SlotFillProvider, Popover } from '@wordpress/components';
import { EntityProvider } from '@wordpress/core-data';
import { InterfaceSkeleton } from '@wordpress/interface';
import { EditorSnackbars, UnsavedChangesWarning } from '@wordpress/editor';
import {
	ShortcutProvider,
	store as keyboardShortcutsStore,
} from '@wordpress/keyboard-shortcuts';

/**
 * Internal dependencies
 */
import NavigationSidebar from '../navigation-sidebar';
import { store as editSiteStore } from '../../store';

function Layout( {
	children,
	isNavigationDefaultOpen,
	activeTemplateType,
	...props
} ) {
	const { isNavigationOpen, previousShortcut, nextShortcut } = useSelect(
		( select ) => {
			const { isNavigationOpened } = select( editSiteStore );
			const { getAllShortcutKeyCombinations } = select(
				keyboardShortcutsStore
			);

			// The currently selected entity to display. Typically template or template part.
			return {
				isNavigationOpen: isNavigationOpened(),
				previousShortcut: getAllShortcutKeyCombinations(
					'core/edit-site/previous-region'
				),
				nextShortcut: getAllShortcutKeyCombinations(
					'core/edit-site/next-region'
				),
			};
		},
		[]
	);

	useEffect( () => {
		if ( isNavigationOpen ) {
			document.body.classList.add( 'is-navigation-sidebar-open' );
		} else {
			document.body.classList.remove( 'is-navigation-sidebar-open' );
		}
	}, [ isNavigationOpen ] );

	return (
		<ShortcutProvider>
			<SlotFillProvider>
				<EntityProvider kind="root" type="site">
					<UnsavedChangesWarning />
					<InterfaceSkeleton
						drawer={
							<NavigationSidebar
								isDefaultOpen={ isNavigationDefaultOpen }
								activeTemplateType={ activeTemplateType }
							/>
						}
						notices={ <EditorSnackbars /> }
						shortcuts={ {
							previous: previousShortcut,
							next: nextShortcut,
						} }
						{ ...props }
					/>
					<Popover.Slot />
					{ children }
				</EntityProvider>
			</SlotFillProvider>
		</ShortcutProvider>
	);
}

export default Layout;
