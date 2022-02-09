/**
 * WordPress dependencies
 */
import { useEntityProp } from '@wordpress/core-data';

export default function NavigationOption( { navigationId, postId } ) {
	const [ title ] = useEntityProp(
		'postType',
		'wp_navigation',
		'title',
		postId
	);

	return (
		<option key={ navigationId } value={ navigationId } label={ title } />
	);
}
