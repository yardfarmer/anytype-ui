import * as React from 'react';
import { Icon } from 'ts/component';
import { I } from 'ts/lib';
import { commonStore } from 'ts/store';

interface Props extends I.Menu {
};

class MenuSelect extends React.Component<Props, {}> {
	
	constructor (props: any) {
		super(props);
		
		this.onSelect = this.onSelect.bind(this);
	};
	
	render () {
		const { param } = this.props;
		const { data } = param;
		const { options, value } = data;
		
		console.log(options);
		
		const Item = (item: any) => {
			let cn = [ 'item' ];
			
			if (item.id == value) {
				cn.push('active');
			};
			
			if (item.isInitial) {
				cn.push('initial');
			};
			
			return (
				<div className={cn.join(' ')} onClick={(e: any) => { this.onSelect(e, item.id); }}>
					{item.icon ? <Icon className={item.icon} /> : ''}
					<div className="name">{item.name}</div>
				</div>
			);
		};
		
		return (
			<div className="items">
				{options.map((item: any, i: number) => (
					<Item key={i} {...item} />
				))}
			</div>
		);
	};
	
	onSelect (e: any, id: string) {
		const { param } = this.props;
		const { data } = param;
		const { onSelect } = data;
		
		commonStore.menuClose('select');
		onSelect(e, id);
	};
	
};

export default MenuSelect;