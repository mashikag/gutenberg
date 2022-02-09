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
	const {
		selectedClientId,
		selectedNavigationId,
		firstNavigationId,
		navigationIds,
	} = useSelect( ( select ) => {
		const {
			__experimentalGetActiveBlockIdByBlockNames,
			__unstableGetGlobalBlocksByName,
			getSelectedBlockClientId,
		} = select( blockEditorStore );
		const selectedNavId = __experimentalGetActiveBlockIdByBlockNames(
			'core/navigation'
		);
		const navIds = __unstableGetGlobalBlocksByName( 'core/navigation' );
		return {
			selectedClientId: getSelectedBlockClientId(),
			selectedNavigationId: selectedNavId,
			firstNavigationId: navIds?.[ 0 ] ?? null,
			navigationIds: navIds.map( ( id ) => ( {
				value: id,
			} ) ),
		};
	}, [] );

	const [ menu, setCurrentMenu ] = useState(
		selectedNavigationId || firstNavigationId
	);

	useEffect( () => {
		if ( selectedNavigationId ) {
			setCurrentMenu( selectedNavigationId );
		}
	}, [ selectedNavigationId, selectedClientId ] );

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

	const showSelectControl = navigationIds.length > 1;

	return (
		<>
			{ showSelectControl && (
				<SelectControl
					options={ navigationIds }
					value={ menu || firstNavigationId }
					onChange={ setCurrentMenu }
				/>
			) }
			<ListView
				blocks={ blocks }
				showNestedBlocks
				__experimentalFeatures
				__experimentalPersistentListViewFeatures
			/>
		</>
	);
}
