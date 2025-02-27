import * as React from 'react';
import $ from 'jquery';
import { MenuItemVertical } from 'Component';
import { analytics, C, I, keyboard, UtilObject, translate, Action } from 'Lib';
import { dbStore } from 'Store';
import Constant from 'json/constant.json';

class MenuTemplateContext extends React.Component<I.Menu> {

	n = -1;

	constructor (props: I.Menu) {
		super(props);

		this.onClick = this.onClick.bind(this);
	};

	render () {
		const items = this.getItems();

		return (
			<div>
				{items.map((action: any, i: number) => (
					<MenuItemVertical
						key={i}
						{...action}
						onMouseEnter={e => this.onMouseEnter(e, action)}
						onClick={e => this.onClick(e, action)}
					/>
				))}
			</div>
		);
	};

	componentDidMount () {
		this.rebind();
	};

	rebind () {
		this.unbind();
		$(window).on('keydown.menu', e => this.props.onKeyDown(e));
		window.setTimeout(() => this.props.setActive(), 15);
	};

	unbind () {
		$(window).off('keydown.menu');
	};

	getItems () {
		const { param } = this.props;
		const { data } = param;
		const { template, isView, onSetDefault, templateId } = data;
		const isBlank = template.id == Constant.templateId.blank;
		const isDefault = template.id == templateId;

		return [
			!isDefault && onSetDefault ? ({ id: 'default', name: isView ? translate('menuDataviewTemplateSetDefaultForView') : translate('commonSetDefault') }) : null,
			!isBlank ? ({ id: 'edit', name: translate('menuDataviewTemplateEdit') }) : null,
			{ id: 'duplicate', name: translate('commonDuplicate') },
			!isBlank ? ({ id: 'remove', name: translate('commonDelete') }) : null,
		].filter(it => it);
	};

	onClick (e: any, item: any) {
		const { param, close } = this.props;
		const { data } = param;
		const { template, onSetDefault, onArchive, onDuplicate, route, typeId } = data;

		close();

		switch (item.id) {
			case 'default': {
				if (onSetDefault) {
					onSetDefault();
				};

				analytics.event('ChangeDefaultTemplate', { route });
				break;
			};

			case 'edit': {
				UtilObject.openPopup(template, {
					onClose: () => $(window).trigger(`updatePreviewObject.${template.id}`)
				});

				analytics.event('EditTemplate', { route });
				break;
			};

			case 'duplicate': {
				analytics.event('DuplicateTemplate', { route });

				if (template.id == Constant.templateId.blank) {
					const type = dbStore.getType(typeId);
					if (!type) {
						break;
					};

					const details: any = {
						type: Constant.typeId.template,
						targetObjectType: typeId,
						layout: type.recommendedLayout,
					};

					C.ObjectCreate(details, [], '', (message) => {
						if (message.error.code) {
							return;
						};

						analytics.event('CreateTemplate', { objectType: typeId, route });

						if (onDuplicate) {
							onDuplicate(message.details);
						};
					});
					break;
				};

				C.ObjectListDuplicate([ template.id ], (message: any) => {
					if (!message.error.code && message.ids.length) {
						if (onDuplicate) {
							onDuplicate({ ...template, id: message.ids[0] });
						};
						analytics.event('DuplicateObject', { count: 1, route });
					};
				});
				break;
			};

			case 'remove': {
				Action.archive([ template.id ], onArchive);
				break;
			};
		};
	};

	onMouseEnter (e: any, item: any) {
		this.onOver(e, item);
	};

	onOver (e: any, item: any) {
		const { param } = this.props;
		const { data } = param;
		const { onOver } = data;

		if (!keyboard.isMouseDisabled) {
			this.props.setActive(item, false);
		};

		if (onOver) {
			onOver();
		};
	};

};

export default MenuTemplateContext;
