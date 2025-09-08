import { SelectionGridWithToolbar } from './components/SelectionGridWithToolbar';
import { generateImageList } from './generate-image-list';

function Demo() {
	const imageList = generateImageList(1000);

	return <SelectionGridWithToolbar items={imageList} />;
}

export default Demo;
