/**
 * External dependencies
 */
import classnames from 'classnames';

/**
 * WordPress dependencies
 */
import { getColorClassName, useBlockProps } from '@wordpress/block-editor';

export default function separatorSave( { attributes } ) {
	const { backgroundColor, style } = attributes;
	const customColor = style?.color?.background;

	// The hr support changing color using border-color, since border-color
	// is not yet supported in the color palette, we use background-color.

	// The dots styles uses text for the dots, to change those dots color is
	// using color, not backgroundColor.
	const colorClass = getColorClassName( 'color', backgroundColor );

	const className = classnames( {
		'has-text-color': backgroundColor || customColor,
		[ colorClass ]: colorClass,
	} );

	const styles = {
		color: colorClass ? undefined : customColor,
	};
	return <hr { ...useBlockProps.save( { className, style: styles } ) } />;
}
