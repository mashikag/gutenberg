/**
 * WordPress dependencies
 */
import { useEntityProp } from '@wordpress/core-data';
import { __, sprintf } from '@wordpress/i18n';

export default function NavigationOption( { navigationId, postId, index } ) {
	let [ title ] = useEntityProp(
		'postType',
		'wp_navigation',
		'title',
		postId
	);

	if ( ! postId || ! title ) {
		// translators: %d: the xth item in the list. e.g. Navigation 4
		title = sprintf( __( 'Navigation %d' ), index );
	}

	return (
		<option key={ navigationId } value={ navigationId } label={ title } />
	);
}
