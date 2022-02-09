/**
 * WordPress dependencies
 */
import { createSlotFill } from '@wordpress/components';

const { Fill: __unstableBlockToolbarListView, Slot } = createSlotFill(
	'__unstableBlockToolbarListView'
);

__unstableBlockToolbarListView.Slot = Slot;

export default __unstableBlockToolbarListView;
