/**
 * WordPress dependencies
 */
import { useSelect } from '@wordpress/data';
import { useState, useEffect } from '@wordpress/element';
import { SelectControl } from '@wordpress/components';

/**
 * Internal dependencies
 */
import NavigationOption from './navigation-option';
import { store as blockEditorStore } from '../../store';
import ListView from '../list-view';

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
			getBlock,
		} = select( blockEditorStore );
		const selectedNavId = __experimentalGetActiveBlockIdByBlockNames(
			'core/navigation'
		);
		const navIds = __unstableGetGlobalBlocksByName( 'core/navigation' );
		return {
			selectedClientId: getSelectedBlockClientId(),
			selectedNavigationId: selectedNavId,
			firstNavigationId: navIds?.[ 0 ] ?? null,
			navigationIds: navIds.map( ( navigationId ) => ( {
				navigationId,
				ref: getBlock( navigationId )?.attributes?.ref,
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
					value={ menu || firstNavigationId }
					onChange={ setCurrentMenu }
				>
					{ navigationIds.map( ( { navigationId, ref } ) => {
						return (
							<NavigationOption
								key={ navigationId }
								navigationId={ navigationId }
								postId={ ref }
							/>
						);
					} ) }
				</SelectControl>
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
