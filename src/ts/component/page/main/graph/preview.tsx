import * as React from 'react';
import { RouteComponentProps } from 'react-router';
import { Loader, IconObject, Cover, Icon, Block, Button } from 'ts/component';
import { detailStore } from 'ts/store';
import { I, C, M, DataUtil } from 'ts/lib';
import { observer } from 'mobx-react';

interface Props extends RouteComponentProps<any> {
	rootId: string;
	onClick?: (e: any) => void;
	setState?: (state: any) => void;
};

interface State {
	loading: boolean;
};

const GraphPreview = observer(class ObjectPreviewBlock extends React.Component<Props, State> {
	
	state = {
		loading: false,
	};
	isOpen: boolean = false;
	_isMounted: boolean = false;
	id: string = '';

	constructor (props: any) {
		super(props);
	};
	
	render () {
		const { loading } = this.state;
		const { rootId, setState } = this.props;
		const check = DataUtil.checkDetails(rootId);
		const object = check.object;
		const { name, description, snippet, coverType, coverId, coverX, coverY, coverScale } = object;
		const author = detailStore.get(rootId, object.creator, []);
		const isTask = object.layout == I.ObjectLayout.Task;
		const cn = [ 'preview', 'blocks', check.className, ];
		const featured: any = new M.Block({ id: rootId + '-featured', type: I.BlockType.Featured, childrenIds: [], fields: {}, content: {} });

		return (
			<div className={cn.join(' ')}>
				{loading ? <Loader /> : (
					<React.Fragment>
						{coverType && coverId ? <Cover type={coverType} id={coverId} image={coverId} className={coverId} x={coverX} y={coverY} scale={coverScale} withScale={true} /> : ''}
						<div className="heading">
							{isTask ? (
								<Icon className={[ 'checkbox', (object.done ? 'active' : '') ].join(' ')} />
							) : (
								<IconObject size={48} iconSize={32} object={object} />
							)}
							<div className="title">{name}</div>
							<div className="description">{description || snippet}</div>

							<Block {...this.props} key={featured.id} rootId={rootId} iconSize={20} block={featured} readonly={true} />
						</div>
						<div className="buttons">
							<Button text="Open" onClick={(e: any) => { DataUtil.objectOpenPopup(object); }} />
							<Button text="Cancel" color="blank" onClick={() => { setState({ view: I.GraphView.Controls }); }} />
						</div>
					</React.Fragment>
				)}
			</div>
		);
	};

	componentDidMount () {
		this._isMounted = true;
		this.open();
	};

	componentDidUpdate () {
		this.open();
	};

	componentWillUnmount () {
		this._isMounted = false;
	};

	open () {
		const { loading } = this.state;
		const { rootId } = this.props;

		if (!this._isMounted || loading || (this.id == rootId)) {
			return;
		};

		this.id = rootId;
		this.setState({ loading: true });

		C.BlockShow(rootId, (message: any) => {
			if (!this._isMounted) {
				return;
			};

			this.setState({ loading: false });
			this.forceUpdate();
		});
	};

});

export default GraphPreview;