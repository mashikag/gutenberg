/**
 * WordPress dependencies
 */
import { useSelect, useDispatch } from '@wordpress/data';
import { useState, useEffect, useCallback } from '@wordpress/element';
import { SelectControl } from '@wordpress/components';
import { store as coreStore } from '@wordpress/core-data';
import {
	__experimentalListView as ListView,
	store as blockEditorStore,
} from '@wordpress/block-editor';

const EMPTY_BLOCKS = [];
const NAVIGATION_MENUS_QUERY = [ { per_page: -1, status: 'publish' } ];

export default function NavigationInspector() {
	const {
		selectedNavigationId,
		clientIdToRef,
		navigationMenus,
		hasResolvedNavigationMenus,
	} = useSelect( ( select ) => {
		const {
			__experimentalGetActiveBlockIdByBlockNames,
			__experimentalGetGlobalBlocksByName,
			getBlock,
		} = select( blockEditorStore );

		const { getNavigationMenus, hasFinishedResolution } = select(
			coreStore
		);
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
			navigationMenus: getNavigationMenus( NAVIGATION_MENUS_QUERY[ 0 ] ),
			hasResolvedNavigationMenus: hasFinishedResolution(
				'getNavigationMenus',
				NAVIGATION_MENUS_QUERY
			),
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
