import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { IconObject, Filter } from 'ts/component';
import { I, C, DataUtil, Util, Onboarding, focus, keyboard, analytics, history as historyPopup, Storage } from 'ts/lib';
import { dbStore, popupStore, detailStore, blockStore } from 'ts/store';
import { observer } from 'mobx-react';

interface Props extends I.BlockComponent {}
interface State {
	filter: string;
}

const $ = require('jquery');
const Constant = require('json/constant.json');

const BlockType = observer(class BlockType extends React.Component<Props, State> {

	ref: any = null;
	n: number = -1;
	state = {
		filter: '',
	};

	constructor (props: any) {
		super(props);
		
		this.onKeyDown = this.onKeyDown.bind(this);
		this.onOut = this.onOut.bind(this);
		this.onFocus = this.onFocus.bind(this);
		this.onFilterFocus = this.onFilterFocus.bind(this);
		this.onFilterChange = this.onFilterChange.bind(this);
	};

	render (): any {
		const { rootId, block } = this.props;
		const items = this.getItems();
		const { filter } = this.state;
		const object = detailStore.get(rootId, rootId, []);
		const type: any = dbStore.getObjectType(object.type) || {};

		const Item = (item: any) => {
			return (
				<div 
					id={'item-' + item.id} 
					className="item" 
					onClick={(e: any) => { this.onClick(e, item); }} 
					onMouseEnter={(e: any) => { this.onOver(e, item); }} 
					onMouseLeave={this.onOut}
				>
					<IconObject size={48} iconSize={32} object={{ ...item, layout: I.ObjectLayout.Type }} />
					<div className="info">
						<div className="txt">
							<div className="name">{item.name}</div>
							<div className="descr">{item.description}</div>
						</div>
						<div className="line" />
					</div>
				</div>
			);
		};
		
		return (
			<div tabIndex={0} onFocus={this.onFocus}>
				<div className="placeholder">
					Choose object type (↓↑ to select) or press ENTER to continue with "{type.name}" type
				</div>

				<Filter 
					ref={(ref: any) => { this.ref = ref; }} 
					inputClassName={'focusable c' + block.id}
					placeholderFocus="Filter types..." 
					value={filter}
					onFocus={this.onFilterFocus}
					onChange={this.onFilterChange}
				/>

				{items.map((item: any) => (
					<Item key={item.id} {...item} />
				))}
			</div>
		);
	};

	componentDidMount () {
		Onboarding.start('typeSelect', this.props.isPopup);
	};

	componentWillUnmount() {
		this.unbind();
	};

	rebind () {
		this.unbind();
		$(window).on('keydown.blockType', (e: any) => { this.onKeyDown(e); });
	};

	unbind () {
		$(window).unbind('keydown.blockType');
	};

	getItems () {
		const { rootId } = this.props;
		const { filter } = this.state;
		const object = detailStore.get(rootId, rootId, []);
		
		let items = DataUtil.getObjectTypesForNewObject(true).filter(it => it.id != object.type);
		if (filter) {
			const reg = new RegExp(Util.filterFix(filter), 'gi');

			items = items.filter((it: any) => {
				let ret = false;
				if (it.name && it.name.match(reg)) {
					ret = true;
					it._sortWeight_ = 100;
				} else 
				if (it.description && it.description.match(reg)) {
					ret = true;
					it._sortWeight_ = 10;
				};
				return ret; 
			});

			items.sort((c1: any, c2: any) => DataUtil.sortByWeight(c1, c2));
		};

		return items;
	};

	onKeyDown (e: any) {
		const { onKeyDown, isPopup, block } = this.props;
		const items = this.getItems();

		keyboard.disableMouse(true);

		keyboard.shortcut('arrowup', e, (pressed: string) => {
			this.n--;

			if (this.n < -1) {
				this.n = -1;
				this.unbind();

				if (onKeyDown) {
					onKeyDown(e, '', [], { from: 0, to: 0 });
				};
			} else
			if (this.n == -1) {
				const value = this.ref.getValue();
				this.ref.setRange({ from: value.length, to: value.length });
			} else {
				focus.clear(true);
				this.setHover(items[this.n], true);
			};
		});

		keyboard.shortcut('arrowdown', e, (pressed: string) => {
			e.preventDefault();

			this.n++;
			if (this.n > items.length - 1) {
				this.n = 0;
				focus.scroll(isPopup);
			};

			focus.clear(true);
			this.setHover(items[this.n], true);
		});

		keyboard.shortcut('enter, space', e, (pressed: string) => {
			e.preventDefault();

			if (items[this.n]) {
				this.onClick(e, items[this.n]);
			};
		});
	};
	
	onFocus () {
		if (this.n >= 0) {
			return;
		};

		const { block } = this.props;
		const value = this.ref ? this.ref.getValue() : '';

		focus.set(block.id, { from: value.length, to: value.length });
	};

	onOver (e: any, item: any) {
		if (!keyboard.isMouseDisabled) {
			this.setHover(item, false);
		};
	};

	onOut () {
		if (!keyboard.isMouseDisabled) {
			const node = $(ReactDOM.findDOMNode(this));
			node.find('.item.hover').removeClass('hover');
		};
	};

	setHover (item: any, scroll: boolean) {
		if (!item) {
			return;
		};

		const { isPopup } = this.props;
		const node = $(ReactDOM.findDOMNode(this));
		const el = node.find('#item-' + item.id);

		node.find('.item.hover').removeClass('hover');
		el.addClass('hover');

		if (scroll) {
			const container = isPopup ? $('#popupPage #innerWrap') : $(window);
			const st = container.scrollTop();
			const h = container.height();
			const o = Constant.size.lastBlock + Util.sizeHeader();

			let y = 0;
			if (isPopup) {
				y = el.offset().top - container.offset().top + st;
			} else {
				y = el.offset().top;
			};
			
			container.scrollTop(Math.max(0, y - h + o));
		};
	};

	onClick (e: any, item: any) {
		if (e.persist) {
			e.persist();
		};

		const { rootId, isPopup } = this.props;
		const param = {
			type: I.BlockType.Text,
			style: I.TextStyle.Paragraph,
		};
		const namespace = isPopup ? '.popup' : '';

		Util.getScrollContainer(isPopup).scrollTop(0);
		Storage.setScroll('editor' + (isPopup ? 'Popup' : ''), rootId, 0);

		let first = null;

		const create = (template: any) => {

			const onBlock = (id: string) => {
				if (first) {
					const l = first.getLength();
					
					focus.set(first.id, { from: l, to: l });
					focus.apply();

					$(window).trigger('resize.editor' + namespace);
				};
			};

			const onTemplate = () => {
				first = blockStore.getFirstBlock(rootId, 1, it => it.isText());
				if (!first) {
					C.BlockCreate(rootId, '', I.BlockPosition.Bottom, param, (message: any) => { onBlock(message.blockId); });
				} else {
					onBlock(first.id);
				};
			};

			if (template) {
				C.ObjectApplyTemplate(rootId, template.id, onTemplate);
			} else {
				C.ObjectSetObjectType(rootId, item.id, onTemplate);
			};

			analytics.event('CreateObject', {
				route: 'SelectType',
				objectType: item.id,
				layout: template?.layout,
				template: (template && template.isBundledTemplate ? template.id : 'custom'),
			});
		};

		const showMenu = () => {
			popupStore.open('template', {
				data: {
					typeId: item.id,
					onSelect: create,
				},
			});
		};

		if (item.id == Constant.typeId.set) {
			C.ObjectToSet(rootId, [], (message: any) => {
				if (isPopup) {
					historyPopup.clear();
				};
				DataUtil.objectOpenEvent(e, { id: message.id, layout: I.ObjectLayout.Set });

				analytics.event('CreateObject', {
					route: 'SelectType',
					objectType: Constant.typeId.set,
					layout: I.ObjectLayout.Set,
				});
			});
		} else {
			DataUtil.checkTemplateCnt([ item.id ], (message: any) => {
				if (message.records.length > 1) {
					showMenu();
				} else {
					create(message.records.length ? message.records[0] : '');
				};
			});
		};
	};

	onFilterFocus (e: any) {
		const node = $(ReactDOM.findDOMNode(this));
		node.find('.item.hover').removeClass('hover');

		this.rebind();
	};

	onFilterChange (e: any) {
		this.setState({ filter: this.ref.getValue() });
	};

});

export default BlockType;