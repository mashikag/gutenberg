/**
 * WordPress dependencies
 */
import { useSelect } from '@wordpress/data';
import { useState, useEffect } from '@wordpress/element';
import { SelectControl } from '@wordpress/components';
import { store as coreStore, useEntityBlockEditor } from '@wordpress/core-data';
import {
	__experimentalListView as ListView,
	store as blockEditorStore,
	BlockEditorProvider,
} from '@wordpress/block-editor';

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

	let options = [];
	if ( navigationMenus ) {
		options = navigationMenus.map( ( { id, title } ) => ( {
			value: id,
			label: title.rendered,
		} ) );
	}

	const [ innerBlocks, onInput, onChange ] = useEntityBlockEditor(
		'postType',
		'wp_navigation',
		{ id: menu }
	);

	const isLoading = ! hasResolvedNavigationMenus;

	return (
		<div className="edit-site-navigation-inspector">
			{ ! isLoading && (
				<SelectControl
					value={ menu }
					options={ options }
					onChange={ setCurrentMenu }
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
				<BlockEditorProvider
					value={ innerBlocks }
					onChange={ onChange }
					onInput={ onInput }
				>
					<ListView
						showNestedBlocks
						showBlockMovers
						__experimentalFeatures
						__experimentalPersistentListViewFeatures
					/>
				</BlockEditorProvider>
			) }
		</div>
	);
}
