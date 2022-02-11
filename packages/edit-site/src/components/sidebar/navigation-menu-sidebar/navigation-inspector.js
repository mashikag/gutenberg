/**
 * WordPress dependencies
 */
import { useSelect, useDispatch } from '@wordpress/data';
import { useState, useEffect, useCallback } from '@wordpress/element';
import { SelectControl } from '@wordpress/components';
import { __experimentalUseNavigationMenu as useNavigationMenu } from '@wordpress/editor';
import {
	__experimentalListView as ListView,
	store as blockEditorStore,
} from '@wordpress/block-editor';

const EMPTY_BLOCKS = [];

export default function NavigationInspector() {
	const { selectedNavigationId, clientIdToRef } = useSelect( ( select ) => {
		const {
			__experimentalGetActiveBlockIdByBlockNames,
			__experimentalGetGlobalBlocksByName,
			getBlock,
		} = select( blockEditorStore );
		const selectedNavId = __experimentalGetActiveBlockIdByBlockNames(
			'core/navigation'
		);
		const navIds = __experimentalGetGlobalBlocksByName( 'core/navigation' );
		const idToRef = {};
		navIds.forEach( ( id ) => {
			idToRef[ id ] = getBlock( id )?.attributes?.ref;
		} );
		return {
			selectedNavigationId: selectedNavId || navIds?.[ 0 ],
			clientIdToRef: idToRef,
		};
	}, [] );

	const [ menu, setCurrentMenu ] = useState(
		clientIdToRef[ selectedNavigationId ]
	);

	useEffect( () => {
		if ( selectedNavigationId ) {
			setCurrentMenu( clientIdToRef[ selectedNavigationId ] );
		}
	}, [ selectedNavigationId ] );

	const { blocks } = useSelect(
		( select ) => {
			const { __unstableGetClientIdsTree } = select( blockEditorStore );
			return {
				blocks: selectedNavigationId
					? __unstableGetClientIdsTree( selectedNavigationId )
					: EMPTY_BLOCKS,
			};
		},
		[ selectedNavigationId ]
	);

	const { navigationMenus, hasResolvedNavigationMenus } = useNavigationMenu();
	let options = [];
	if ( navigationMenus ) {
		options = navigationMenus.map( ( { id, title } ) => ( {
			value: id,
			label: title.rendered,
		} ) );
	}

	const { updateBlock } = useDispatch( blockEditorStore );
	const selectMenu = useCallback(
		( wpNavigationId ) => {
			setCurrentMenu( wpNavigationId );
			updateBlock( selectedNavigationId, {
				attributes: { ref: wpNavigationId },
			} );
		},
		[ selectedNavigationId ]
	);
	const isLoading = ! hasResolvedNavigationMenus;

	return (
		<div className="edit-site-navigation-inspector">
			{ ! isLoading && (
				<SelectControl
					value={ menu }
					options={ options }
					onChange={ selectMenu }
				/>
			) }
			{ isLoading && (
				<>
					<div className="edit-site-navigation-inspector__placeholder" />
					<div className="edit-site-navigation-inspector__placeholder is-child" />
					<div className="edit-site-navigation-inspector__placeholder is-child" />
				</>
			) }
			{ ! isLoading && (
				<ListView
					blocks={ blocks }
					showNestedBlocks
					showBlockMovers
					__experimentalFeatures
					__experimentalPersistentListViewFeatures
				/>
			) }
		</div>
	);
}
