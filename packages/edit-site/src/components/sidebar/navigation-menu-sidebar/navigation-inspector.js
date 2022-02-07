/**
 * WordPress dependencies
 */
import { useSelect } from '@wordpress/data';
import {
	store as blockEditorStore,
	__experimentalListView as ListView,
} from '@wordpress/block-editor';

const EMPTY_BLOCKS = [];
export default function NavigationInspector() {
	const { blocks } = useSelect( ( select ) => {
		const {
			__unstableGetClientIdsTree,
			getSelectedBlockClientId,
			getBlockParentsByBlockName,
			getBlockName,
		} = select( blockEditorStore );
		let clientId = getSelectedBlockClientId();
		const selectedBlockName = getBlockName( clientId );
		//if selected block isn't a navigation block, find closest parent who is
		if ( selectedBlockName !== 'core/navigation' ) {
			const navigationBlocks = getBlockParentsByBlockName(
				clientId,
				'core/navigation'
			);
			if ( navigationBlocks.length > 0 ) {
				clientId = navigationBlocks[ 0 ];
			} else {
				clientId = undefined;
			}
		}
		return {
			blocks: clientId
				? __unstableGetClientIdsTree( clientId )
				: EMPTY_BLOCKS,
		};
	}, [] );

	// No navigation blocks are not selected, render the first navigation menu available on the post or page.
	if ( blocks === EMPTY_BLOCKS ) {
		return 'todo: render first available navigation menu';
	}

	return (
		<ListView
			blocks={ blocks }
			showNestedBlocks
			__experimentalFeatures
			__experimentalPersistentListViewFeatures
		/>
	);
}
