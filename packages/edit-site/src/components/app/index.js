/**
 * WordPress dependencies
 */
import { useSelect, useDispatch } from '@wordpress/data';
import { store as interfaceStore } from '@wordpress/interface';
import { store as coreStore } from '@wordpress/core-data';
import { sprintf, __ } from '@wordpress/i18n';
import { store as noticesStore } from '@wordpress/notices';

/**
 * Internal dependencies
 */
import { store as editSiteStore } from '../../store';
import { useLocation } from '../routes';
import Editor from '../editor';
import List from '../list';
import getIsListPage from '../../utils/get-is-list-page';

export default function EditSiteApp( { reboot } ) {
	const { params } = useLocation();
	const {
		isInserterOpen,
		isListViewOpen,
		sidebarIsOpened,
		postType,
	} = useSelect(
		( select ) => {
			const { isInserterOpened, isListViewOpened } = select(
				editSiteStore
			);

			// The currently selected entity to display. Typically template or template part.
			return {
				isInserterOpen: isInserterOpened(),
				isListViewOpen: isListViewOpened(),
				sidebarIsOpened: !! select(
					interfaceStore
				).getActiveComplementaryArea( editSiteStore.name ),
				postType: select( coreStore ).getPostType( params.postType ),
			};
		},
		[ params.postType ]
	);
	const { createErrorNotice } = useDispatch( noticesStore );

	const isListPage = getIsListPage( params );

	function onPluginAreaError( name ) {
		createErrorNotice(
			sprintf(
				/* translators: %s: plugin name */
				__(
					'The "%s" plugin has encountered an error and cannot be rendered.'
				),
				name
			)
		);
	}

	return isListPage
		? List.renderLayout( {
				postType,
				activeTemplateType: params.postType,
		  } )
		: Editor.renderLayout( {
				isInserterOpen,
				isListViewOpen,
				sidebarIsOpened,
				reboot,
				onPluginAreaError,
		  } );
}
