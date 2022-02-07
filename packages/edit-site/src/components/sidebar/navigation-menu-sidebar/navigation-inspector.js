/**
 * WordPress dependencies
 */
import { useSelect } from '@wordpress/data';
import {
	store as blockEditorStore,
	__experimentalListView as ListView,
} from '@wordpress/block-editor';
import { useEntityProp } from '@wordpress/core-data';
import { __experimentalHeading as Heading } from '@wordpress/components';
import { decodeEntities } from '@wordpress/html-entities';

const EMPTY_BLOCKS = [];

export default function NavigationInspector() {
	const { selectedNavigationId } = useSelect( ( select ) => {
		const {
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
			selectedNavigationId: clientId,
		};
	}, [] );

	const { firstNavigationId } = useSelect( ( select ) => {
		const { __unstableGetGlobalBlocksByName } = select( blockEditorStore );
		const _navigationIds = __unstableGetGlobalBlocksByName(
			'core/navigation'
		);
		return {
			firstNavigationId: _navigationIds?.[ 0 ] ?? null,
			navigationIds: _navigationIds,
		};
	}, [] );

	const { blocks, navRef } = useSelect(
		( select ) => {
			const { __unstableGetClientIdsTree, getBlock } = select(
				blockEditorStore
			);
			const clientId = selectedNavigationId ?? firstNavigationId;
			return {
				blocks: clientId
					? __unstableGetClientIdsTree( clientId )
					: EMPTY_BLOCKS,
				navRef: getBlock( clientId )?.attributes?.ref ?? null,
			};
		},
		[ selectedNavigationId, firstNavigationId ]
	);

	// eslint-disable-next-line no-unused-vars
	const [ property, setter, title ] = useEntityProp(
		'postType',
		'wp_navigation',
		'title',
		navRef
	);

	const label = decodeEntities( title?.rendered );

	return (
		<>
			<Heading
				level={ 2 }
				className={ 'edit-site-navigation-inspector__title' }
			>
				{ label }
			</Heading>
			<ListView
				blocks={ blocks }
				showNestedBlocks
				__experimentalFeatures
				__experimentalPersistentListViewFeatures
			/>
		</>
	);
}
