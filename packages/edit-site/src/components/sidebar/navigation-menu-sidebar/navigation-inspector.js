/**
 * WordPress dependencies
 */
import { useSelect } from '@wordpress/data';
import { useState, useEffect } from '@wordpress/element';
import {
	store as blockEditorStore,
	__experimentalListView as ListView,
} from '@wordpress/block-editor';
import { SelectControl } from '@wordpress/components';

const EMPTY_BLOCKS = [];

export default function NavigationInspector() {
	const { selectedNavigationId } = useSelect( ( select ) => {
		const { __experimentalGetActiveBlockIdByBlockNames } = select(
			blockEditorStore
		);
		const selectedId = __experimentalGetActiveBlockIdByBlockNames(
			'core/navigation'
		);
		return {
			selectedNavigationId: selectedId,
		};
	}, [] );

	const [ menu, setCurrentMenu ] = useState( selectedNavigationId );

	useEffect( () => {
		if ( selectedNavigationId ) {
			setCurrentMenu( selectedNavigationId );
		}
	}, [ selectedNavigationId ] );

	const { firstNavigationId, navigationIds } = useSelect( ( select ) => {
		const { __unstableGetGlobalBlocksByName } = select( blockEditorStore );
		const _navigationIds = __unstableGetGlobalBlocksByName(
			'core/navigation'
		);
		return {
			firstNavigationId: _navigationIds?.[ 0 ] ?? null,
			navigationIds: _navigationIds.map( ( id ) => ( {
				value: id,
			} ) ),
		};
	}, [] );

	const { blocks } = useSelect(
		( select ) => {
			const { __unstableGetClientIdsTree } = select( blockEditorStore );
			const id = menu || firstNavigationId;
			return {
				blocks: id ? __unstableGetClientIdsTree( id ) : EMPTY_BLOCKS,
			};
		},
		[ menu, firstNavigationId ]
	);

	return (
		<>
			<SelectControl
				options={ navigationIds }
				value={ menu || firstNavigationId }
				onChange={ setCurrentMenu }
			/>
			<ListView
				blocks={ blocks }
				showNestedBlocks
				__experimentalFeatures
				__experimentalPersistentListViewFeatures
			/>
		</>
	);
}
