/**
 * WordPress dependencies
 */
import { store as coreStore } from '@wordpress/core-data';
import { useSelect } from '@wordpress/data';

export default function __experimentalUseNavigationMenu() {
	return useSelect( ( select ) => {
		const { getEntityRecords, hasFinishedResolution } = select( coreStore );

		const navigationMenuMultipleArgs = [
			'postType',
			'wp_navigation',
			{ per_page: -1, status: 'publish' },
		];
		const navigationMenus = getEntityRecords(
			...navigationMenuMultipleArgs
		);

		return {
			hasResolvedNavigationMenus: hasFinishedResolution(
				'getEntityRecords',
				navigationMenuMultipleArgs
			),
			navigationMenus,
		};
	}, [] );
}
