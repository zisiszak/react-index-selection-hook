import { memo } from 'react';
import styles from './Item.module.css';

interface ItemProps {
	index: number;
	selected: boolean;
	imageSrc: string;
	selectionEnabled: boolean;
}
export const Item = memo(
	({ index, selected, selectionEnabled, imageSrc }: ItemProps) => {
		return (
			<div
				className={styles.item}
				selection-index={index}
				style={selected ? { color: 'red' } : undefined}
			>
				{selectionEnabled && (
					<div
						className={
							selected
								? styles.itemSelectionCircleSelected
								: styles.itemSelectionCircle
						}
					></div>
				)}
				<img
					src={imageSrc}
					className={
						selectionEnabled
							? styles.imageDuringSelection
							: styles.image
					}
				/>
			</div>
		);
	},
	(prev, next) =>
		prev.index === next.index &&
		prev.selected === next.selected &&
		prev.selectionEnabled === next.selectionEnabled,
);
