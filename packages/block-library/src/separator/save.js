/**
 * WordPress dependencies
 */
import { useBlockProps } from '@wordpress/block-editor';

export default function separatorSave( { attributes } ) {
	const { className } = attributes;

	return <hr { ...useBlockProps.save( { className } ) } />;
}
