import * as registerSuite from 'intern!object';
import * as assert from 'intern/chai!assert';
import { VNode } from 'dojo-interfaces/vdom';
import createButton, { ButtonState } from '../../../../src/components/button/createButton';

registerSuite({
	name: 'createButton',
	construction() {
		const button = createButton({
			state: {
				id: 'foo',
				label: 'bar',
				name: 'baz'
			}
		});
		assert.strictEqual(button.state.id, 'foo');
		assert.strictEqual(button.state.label, 'bar');
		assert.strictEqual(button.state.name, 'baz');
	},
	render() {
		const button = createButton({
			state: {
				id: 'foo',
				label: 'bar',
				name: 'baz'
			}
		});
		const vnode = <VNode> button.render();
		assert.strictEqual(vnode.vnodeSelector, 'button');
		assert.strictEqual(vnode.properties!.innerHTML, 'bar');
		assert.strictEqual(vnode.properties!['data-widget-id'], 'foo');
		assert.strictEqual(vnode.properties!.name, 'baz');
		assert.strictEqual(vnode.properties!['type'], 'button');
		assert.lengthOf(vnode.children, 0);
	},
	disable() {
		const button = createButton({
			state: <ButtonState> {
				id: 'foo',
				label: 'bar',
				name: 'baz'
			}
		});
		let vnode = <VNode> button.render();
		assert.isFalse(vnode.properties!['disabled']);
		button.setState({
			disabled: true
		});
		vnode = <VNode> button.render();
		assert.isTrue(vnode.properties!['disabled']);
	}
});
