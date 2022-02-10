/**
 * WordPress dependencies
 */
import { ComplementaryArea } from '@wordpress/interface';
import { FlexBlock, Flex } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { navigation } from '@wordpress/icons';
import { __experimentalNavigationInspector as NavigationInspector } from '@wordpress/block-editor';

export default function NavigationMenuSidebar() {
	return (
		<ComplementaryArea
			className={ 'edit-post-navigation-menu-sidebar' }
			scope={ 'core/edit-post' }
			identifier={ 'edit-post/navigation-menu' }
			title={ __( 'Navigation' ) }
			icon={ navigation }
			closeLabel={ __( 'Close navigation menu sidebar' ) }
			header={
				<Flex>
					<FlexBlock>
						<strong>{ __( 'Navigation' ) }</strong>
					</FlexBlock>
				</Flex>
			}
			panelClassName={ 'edit-post-navigation-menu-sidebar__panel' }
		>
			<NavigationInspector />
		</ComplementaryArea>
	);
}
