import * as React from 'react';
import { RouteComponentProps } from 'react-router';
import { Icon, Smile, DropTarget } from 'ts/component';
import { I, C, Util, DataUtil } from 'ts/lib';
import { authStore, commonStore, blockStore } from 'ts/store';
import { observer } from 'mobx-react';

interface Props {
	dataset?: any;
	rootId: string;
	block: I.Block;
	index: number;
	onPath (e: any, block: I.Block, index: number): void;
};

@observer
class HeaderItemPath extends React.Component<Props, {}> {

	render () {
		const { rootId, block, index, onPath } = this.props;
		const { breadcrumbs } = blockStore;
		const { id, content } = block;
		const details = blockStore.getDetail(breadcrumbs, content.targetBlockId);
		const { iconEmoji, name } = details;
		
		let icon = null;
		if (false) {
			
		} else {
			icon = <Smile icon={iconEmoji} />;
		};
		
		return (
			<DropTarget {...this.props} className="item" id={id} rootId={breadcrumbs} dropType={I.DragItem.Menu} targetContextId={content.targetBlockId} onClick={(e: any) => { onPath(e, block, index); }}>
				{icon}
				<div className="name">{Util.shorten(name, 32)}</div>
				<Icon className="arrow" />
			</DropTarget>
		);
	};


 	
};

export default HeaderItemPath;