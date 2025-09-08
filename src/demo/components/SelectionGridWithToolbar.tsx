import { useState } from 'react';
import { useIndexSelection } from '../../use-index-selection';
import { Item } from './Item';
import styles from './SelectionGridWithToolbar.module.css';

interface SelectionGridProps {
	items: Array<{ imageSrc: string }>;
}
export function SelectionGridWithToolbar({ items }: SelectionGridProps) {
	const [selectionEnabled, setSelectionEnabled] = useState<boolean>(true);
	const {
		selected,
		containerRef: gridRef,
		selectAll,
		deselectAll,
	} = useIndexSelection({
		enabled: selectionEnabled,
	});

	return (
		<div>
			<div className={styles.toolbar}>
				<button
					className={styles.button}
					onClick={() => setSelectionEnabled((prev) => !prev)}
				>
					Selection mode: {selectionEnabled ? 'On' : 'Off'}
				</button>
				{selectionEnabled && (
					<button className={styles.button} onClick={selectAll}>
						Select all
					</button>
				)}
				{selectionEnabled && (
					<button className={styles.button} onClick={deselectAll}>
						Deselect all
					</button>
				)}
			</div>
			<div
				className={[
					styles.grid,
					selectionEnabled ? 'selectionEnabled' : '',
				].join(' ')}
				ref={gridRef}
			>
				{items.map(({ imageSrc }, index) => (
					<Item
						key={index}
						index={index}
						imageSrc={imageSrc}
						selected={selected.has(index)}
						selectionEnabled={selectionEnabled}
					/>
				))}
			</div>
		</div>
	);
}
