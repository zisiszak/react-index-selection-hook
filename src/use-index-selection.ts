import { useEffect, useRef, useState } from 'react';
// import { ASSERT } from './assert';

export function useIndexSelection<E extends HTMLElement = HTMLDivElement>({
	enabled = true,
}: {
	enabled?: boolean;
}) {
	// Single state variable, synchronised only when deemed necessary.
	const [state, setState] = useState<Set<number>>(new Set());
	const selectedIndicesRef = useRef<Set<number>>(new Set());
	/**
	 * [clientX, clientY] of the initial pointer down event, or `null` if there is no current pointer interaction running.
	 */
	const pointerStartCoordsRef = useRef<[number, number] | null>(null);
	const pointerMode = useRef<'+' | '-'>('+');
	/**
	 * Current pointer interaction selection range.
	 * @note If the first element is a number and the second element is `null`, then a range hasn't yet been established.  If a pointer interaction ends with index range type, then it's considered a single index toggle.
	 */
	const pointerRange = useRef<[number, number | null] | [null, null]>([
		null,
		null,
	]);
	/**
	 * The previous range end (within the same pointer interaction).
	 * Sure, could just use the diff, but this is probably easier to understand.
	 */
	const pointerPrevRangeEnd = useRef<number | null>(null);
	/**
	 * The current index diff (aka what the current pointer interaction has changed so far).
	 * This allows for undoing during a range action without altering any selections made prior to the current interaction.
	 */
	const pointerIndexDiff = useRef<Set<number>>(new Set());
	/** The element containing indexed children. */
	const containerRef = useRef<E>(null);

	const syncState = () => void setState(new Set(selectedIndicesRef.current));

	/** Returns false if the indexSet already includes the index. Otherwise, returns true after adding the index to the set. */
	const selectIndex = (index: number) => {
		if (selectedIndicesRef.current.has(index)) return false;
		selectedIndicesRef.current.add(index);
		return true;
	};
	/** Returns true if the index is found in the set and deleted, or false if the index is not in the set. */
	const deselectIndex = (index: number) =>
		selectedIndicesRef.current.delete(index);
	const toggleIndex = (index: number) =>
		void (
			!selectedIndicesRef.current.delete(index) &&
			selectedIndicesRef.current.add(index)
		);
	const clearIndices = () => selectedIndicesRef.current.clear();

	const deselectAllAndSync = () => {
		clearIndices();

		syncState();
	};
	const selectAllAndSync = () => {
		if (!containerRef.current) return;

		clearIndices();
		for (let i = 0; i < containerRef.current.childElementCount; i++)
			selectedIndicesRef.current.add(i);

		syncState();
	};

	/**
	 * Add mode: The start index is not already selected.
	 * Remove move: The start index is already selected.
	 *
	 * Returns `true` if the set changed, or `false` otherwise.
	 */
	const updateSelectedIndicesUsingActiveRange = () => {
		// `from` is always the same over the lifespan of a selection range.
		const [from, to] = pointerRange.current as [number, number];
		const prevTo = pointerPrevRangeEnd.current;

		// ASSERT(
		// 	typeof from === 'number' && typeof to === 'number',
		// 	'from and/or to are not numbers',
		// );

		const baseFn =
			pointerMode.current === '+' ? selectIndex : deselectIndex;
		const negateFn =
			pointerMode.current === '+' ? deselectIndex : selectIndex;

		let changed: boolean = false;

		let addRange: null | [number, number] = null;
		let negateRange: null | [number, number] = null;
		if (prevTo === null) {
			addRange = [from < to ? from : to, from < to ? to : from];
		} else if (to > from) {
			if (prevTo > from) {
				if (to > prevTo) addRange = [prevTo + 1, to];
				else negateRange = [to + 1, prevTo];
			} else {
				addRange = [from, to];
				negateRange = [prevTo, from - 1];
			}
		} else {
			if (prevTo < from) {
				if (to < prevTo) addRange = [to, prevTo - 1];
				else negateRange = [prevTo, to - 1];
			} else {
				addRange = [to, from];
				negateRange = [from + 1, prevTo];
			}
		}

		if (addRange !== null)
			for (let i = addRange[0]; i <= addRange[1]; i++) {
				if (
					selectedIndicesRef.current.has(i)
						? pointerMode.current === '-'
						: pointerMode.current === '+'
				) {
					baseFn(i) && (changed = true);
					pointerIndexDiff.current.add(i);
				}
			}
		if (negateRange !== null)
			for (let i = negateRange[0]; i <= negateRange[1]; i++) {
				if (pointerIndexDiff.current.has(i)) {
					negateFn(i) && (changed = true);
				}
			}

		return changed;
	};

	// This prevents flickering of previous selections when toggling between enabled and disabled multiple times.
	useEffect(() => {
		if (!enabled) deselectAllAndSync();
	}, [enabled]);

	useEffect(() => {
		const container = containerRef.current;
		if (!container || !enabled) return;

		const resolveIndexFromCoordinates = (
			clientX: number,
			clientY: number,
		) => {
			const elementsUnderPointerList = document.elementsFromPoint(
				clientX,
				clientY,
			);
			/** An index of the `elementsUnderPointerList` that contains the `container` element */
			const indexOfContainerEl = elementsUnderPointerList.findIndex(
				(el) => el === container,
			);

			if (
				// Pointer is not positioned over the container.
				indexOfContainerEl === -1 ||
				// Pointer is positioned over the container, but not over a child of the container
				indexOfContainerEl === 0
			)
				return null;

			const selectionTargetEl =
				elementsUnderPointerList[indexOfContainerEl - 1]!;
			// ASSERT(!!selectionTargetEl, 'selectionTargetEl is not defined');

			const selectionIndex = parseInt(
				selectionTargetEl.getAttribute('selection-index') ?? '',
			);
			if (Number.isNaN(selectionIndex)) {
				console.warn(
					`selectionIndex is NaN (attribute 'selection-index' could not be parsed on container child).`,
				);
				return null;
			}

			return selectionIndex;
		};

		const endPointerInteraction = () => {
			container.onpointermove = null;
			container.style.touchAction = '';

			// Handle a single, non-range selection.
			if (
				pointerRange.current[0] !== null &&
				pointerRange.current[1] === null
			) {
				toggleIndex(pointerRange.current[0]);
				syncState();
			}

			pointerRange.current = [null, null];

			pointerStartCoordsRef.current = null;
			pointerPrevRangeEnd.current = null;
			pointerIndexDiff.current.clear();
		};

		const handlePointerMove = (e: PointerEvent) => {
			const { clientX, clientY } = e;
			// ASSERT(pointerIndexRange.current[0] !== null, 'pointerIndexRange[0] is null.');

			let prevRangeEndIndex = pointerRange.current[1];

			// Establish whether to begin a range selection based on pointer movement direction
			if (prevRangeEndIndex === null) {
				// ASSERT(pointerStartCoordsRef !== null, 'pointerStartCoordsRef is null!');

				// end interaction if movement is considered vertical, with no selection changes.
				const [initalX, initalY] = pointerStartCoordsRef.current!;
				const i = clientX - initalX;
				const j = clientY - initalY;
				const theta = Math.abs(Math.atan2(j, i));
				if (theta > Math.PI / 4 && theta < (3 * Math.PI) / 4) {
					pointerRange.current[0] = null;
					return void endPointerInteraction();
				}
			}

			// from this point on, both elements in `pointerIndexRange.current` are not null.

			const endIndex = resolveIndexFromCoordinates(clientX, clientY);
			if (endIndex !== null && endIndex !== prevRangeEndIndex) {
				pointerPrevRangeEnd.current = pointerRange.current[1];
				pointerRange.current[1] = endIndex;

				updateSelectedIndicesUsingActiveRange() && syncState();
			}
		};

		const handlePointerDown = (e: PointerEvent) => {
			const { clientX, clientY } = e;

			const startIndex = resolveIndexFromCoordinates(clientX, clientY);
			if (startIndex === null) return;

			e.stopImmediatePropagation();

			pointerRange.current[0] = startIndex;
			pointerMode.current = selectedIndicesRef.current.has(startIndex)
				? '-'
				: '+';
			pointerStartCoordsRef.current = [clientX, clientY];

			container.style.touchAction = 'none';
			container.setPointerCapture(e.pointerId);
			container.onpointermove = handlePointerMove;
		};

		container.onpointerdown = handlePointerDown;
		container.onpointerup = endPointerInteraction;
		container.onpointercancel = endPointerInteraction;

		return () => {
			container.onpointerdown = null;
			container.onpointercancel = null;
			container.onpointerup = null;
			container.onpointermove = null;
			container.style.touchAction = '';

			endPointerInteraction();
		};
	}, [containerRef, enabled]);

	return {
		containerRef,
		selected: state,
		deselectAll: deselectAllAndSync,
		selectAll: selectAllAndSync,
	};
}
