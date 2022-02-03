/**
 * WordPress dependencies
 */
import { FlexBlock, Flex } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { navigation } from '@wordpress/icons';
import { useSelect } from '@wordpress/data';
import {
	store as blockEditorStore,
	__experimentalListView as ListView,
} from '@wordpress/block-editor';

/**
 * Internal dependencies
 */
import DefaultSidebar from './default-sidebar';

export default function NavigationMenuSidebar() {
	const { blocks } = useSelect( ( select ) => {
		const { __unstableGetClientIdsTree, getSelectedBlockClientId } = select(
			blockEditorStore
		);
		const clientId = getSelectedBlockClientId();
		return {
			blocks: __unstableGetClientIdsTree( clientId ),
		};
	}, [] );

	return (
		<DefaultSidebar
			className="edit-site-navigation-menu-sidebar"
			identifier="edit-site/navigation-menu"
			title={ __( 'Navigation' ) }
			icon={ navigation }
			closeLabel={ __( 'Close navigation menu sidebar' ) }
			panelClassName="edit-site-navigation-menu-sidebar__panel"
			header={
				<Flex>
					<FlexBlock>
						<strong>{ __( 'Navigation' ) }</strong>
					</FlexBlock>
				</Flex>
			}
		>
			<ListView
				blocks={ blocks }
				showNestedBlocks
				__experimentalFeatures
				__experimentalPersistentListViewFeatures
			/>
		</DefaultSidebar>
	);
}
