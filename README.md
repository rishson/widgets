# dojo-widgets

[![Build Status](https://travis-ci.org/dojo/widgets.svg?branch=master)](https://travis-ci.org/dojo/widgets)
[![codecov](https://codecov.io/gh/dojo/widgets/branch/master/graph/badge.svg)](https://codecov.io/gh/dojo/widgets)
[![npm version](https://badge.fury.io/js/dojo-widgets.svg)](http://badge.fury.io/js/dojo-widgets)

A core widget library for Dojo.

**WARNING** This is *alpha* software. It is not yet production ready, so you should use at your own risk.

For more background on dojo-widgets, there is a document describing the [widgeting system](https://github.com/dojo/meta/blob/master/documents/Widget-System.md).

- [Usage](#usage)
- [Features](#features)
    - [Base Widget](#base-widget)
    	- [Simple Widgets](#simple-widgets)
    	- [d](#d)
    	- [Widgets with Children](#widgets-with-children)
    - [Authoring Custom Widgets](#authoring-custom-widgets)
    - [Projector](#projector)
    - [Dojo Widget Components](#dojo-widget-components)
- [How Do I Contribute?](#how-do-i-contribute)
    - [Installation](#installation)
    - [Testing](#testing)
- [Licensing Information](#licensing-information)

## Usage

To use dojo-widgets in a project install the package along with the required peer dependencies.

```shell
npm install dojo-widgets

# peer dependencies
npm install dojo-has
npm install dojo-shim
npm install dojo-core
npm install dojo-compose
npm install dojo-store
```

To use dojo-widgets import the module in the project. For more details see [features](#features) below.

```ts
import createButton from 'dojo-widgets/components/button/createButton';
```

or use the [dojo cli](https://github.com/dojo/cli-create-app) to create a complete Dojo skeleton application.

## Features

dojo-widgets are based on a virtual DOM implementation named [Maquette](http://maquettejs.org/) as well as some foundational classes
provided in [dojo-compose](https://github.com/dojo/compose).

The smallest `dojo-widgets` example looks like this:

```ts
const projector = createProjector();
projector.children = [ d('h1', [ 'Hello, Dojo!' ]) ];
projector.append();
```

It renders a header saying "Hello World" on the page, see the following sections for more details.

### Base Widget

The class `createWidgetBase` provides all base dojo-widgets functionality including caching and widget lifecycle management. It can be used directly or extended to create custom widgets.

To customise the widget an optional `options` argument can be provided with the following interface.

**Type**: `WidgetOptions<WidgetState>` - All properties are optional.

|Property|Type|Description|
|---|---|---|
|id|string|identifier for the widget|
|state|WidgetState|Initial state of the widget|
|stateFrom|StoreObservablePatchable|Observable that provides state for the widget|
|listeners|EventedListenersMap|Map of listeners for to attach to the widget|
|tagName|string|Override the widgets tagname|
|nodeAttributes|Function[]|An array of functions that return VNodeProperties to be applied to the VNode|

By default the base widget class applies `id`, `classes` and `styles` from the widget's specified `state` (either by direct state injection or via an observable store).

#### Simple Widgets
To create a basic widget `createWidgetBase` can be used directly by importing the class.

```ts
import createWidgetBase from 'dojo-widgets/createWidgetBase';

const myBasicWidget = createWidgetBase();
```

The widget creates the following DOM element:

```html
<div></div>
```
The following example demonstrates how `id`, `classes` and `styles` are applied to the generated DOM.

```ts
import createWidgetBase from 'dojo-widgets/createWidgetBase';

const myBasicWidget = createWidgetBase({
    state: {
        id: 'my-widget',
        classes: [ 'class-a', 'class-b' ],
        styles: [ 'width:20px' ]
    }
});
```

The widget creates the following DOM element:

```html
<div data-widget-id="my-widget" class="class-a class-b" styles="width:20px"></div>
```
Alternatively state can be derived directly from an observable store passed via `stateFrom`. The following code will create the same DOM element as the above example.

```ts
const widgetStore = createObservableStore({
    data: [
        {
            id: 'my-widget',
            classes: [ 'class-a', 'class-b' ],
            styles: [ 'width:20px' ]
        }
    ]
});

const myBasicWidget = createWidgetBase({
    id: 'my-widget',
    stateFrom: widgetStore
});
```

#### `d`

`d` is the canonical mechanism for `dojo-widgets` to express a widget hierarchical structure using either Dojo widget factories or Hyperscript.

It is imported by:

```ts
import d from 'dojo-widgets/d';
```

The argument and return types are available from `dojo-widgets/interfaces` as follows:

```ts
import { DNode, HNode, WNode } from 'dojo-widgets/interfaces';
```

##### Hyperscript

Creates an element with the `tagName`

```ts
d(tagName: string): HNode[];
```

Creates an element with the `tagName` with the children specified by the array of `DNode`, `VNode` or `null`.

```ts
d(tagName: string, children: (DNode | VNode | null)[]): HNode[];
```
Creates an element with the `tagName` with the `VNodeProperties` options and optional children specified by the array of `DNode`, `VNode` or `null`.

```ts
d(tagName: string, options: VNodeProperties, children?: (DNode | VNode | null)[]): HNode[];
```
##### Dojo Widget

Creates a dojo-widget using the `factory` and `options`.

```ts
d(factory: ComposeFactory<W, O>, options: O): WNode[];
```

Creates a dojo-widget using the `factory` and `options` and the `children`

```ts
d(factory: ComposeFactory<W, O>, options: O, children: DNode[]): WNode[];
```

### Authoring Custom Widgets

To create custom reusable widgets you can extend `createWidgetBase`.

A simple widget with no children such as a `label` widget can be created like this:

```ts
import { ComposeFactory } from 'dojo-compose/compose';
import { VNodeProperties } from 'dojo-interfaces/vdom';
import { Widget, WidgetOptions, WidgetState } from 'dojo-widgets/interfaces';
import createWidgetBase from 'dojo-widgets/createWidgetBase';

interface LabelState extends WidgetState {
    label?: string;
}

interface LabelOptions extends WidgetOptions<LabelState> { }

type Label = Widget<LabelState>;

interface LabelFactory extends ComposeFactory<Label, LabelOptions> { }

const createLabelWidget: LabelFactory = createWidgetBase.mixin({
    mixin: {
        tagName: 'label',
        nodeAttributes: [
            function(this: Label): VNodeProperties {
                return { innerHTML: this.state.label };
            }
        ]
    }
});

export default createLabelWidget;
```
With its usages as follows:

```ts
import createLabelWidget from './widgets/createLabelWidget';

const label = createLabelWidget({ state: { label: 'I am a label' }});
```

To create structured widgets override the `getChildrenNodes` function.

```ts
import { ComposeFactory } from 'dojo-compose/compose';
import { DNode, Widget, WidgetOptions, WidgetState } from 'dojo-widgets/interfaces';
import createWidgetBase from 'dojo-widgets/createWidgetBase';
import d from 'dojo-widgets/d';

interface ListItem {
    name: string;
}

interface ListState extends WidgetState {
    items?: ListItem[];
};

interface ListOptions extends WidgetOptions<ListState> { };

type List = Widget<ListState>;

interface ListFactory extends ComposeFactory<List, ListOptions> { };

function isEven(value: number) {
    return value % 2 === 0;
}

function listItem(item: ListItem, itemNumber: number): DNode {
    const classes = isEven(itemNumber) ? {} : { 'odd-row': true };
    return d('li', { innerHTML: item.name, classes });
}

const createListWidget: ListFactory = createWidgetBase.mixin({
	mixin: {
		getChildrenNodes: function (this: List): DNode[] {
			const { items = [] } = this.state;
			const listItems = items.map(listItem);

			return [ d('ul', {}, listItems) ];
		}
	}
});

export default createListWidget;
```

### Projector

To render widgets they must be appended to a `projector`. It is possible to create many projectors and attach them to `Elements` in the `DOM`, however `projectors` must not be nested.

The projector works in the same way as any widget overridding `getChildrenNodes` when `createProjector` class is used as the base for a custom widget (usually the root of the application).

In addition when working with a `projector` you can also set the `children` directly.

The standard `WidgetOptions` are available and also `createProjector` adds two additional optional properties `root` and `cssTransitions`.

 * `root` - The `Element` that the projector attaches to. The default value is `document.body`
 * `cssTransitions` - Set to `true` to support css transitions and animations. The default value is `false`.

**Note**: If `cssTransitions` is set to `true` then the projector expects Maquette's `css-transitions.js` to be loaded.

In order to attach the `createProjector` to the page call either `.append`, `.merge` or `.replace` depending on the type of attachment required and it returns a promise.

Instantiating `createProjector` directly:

```ts
import { DNode } from 'dojo-widgets/interfaces';
import d from 'dojo-widgets/d';
import createProjector, { Projector } from 'dojo-widgets/createProjector';
import createButton from 'dojo-widgets/components/button/createButton';
import createTextInput from 'dojo-widgets/components/textinput/createTextInput';

const projector = createProjector();

projector.children = [
	d(createTextInput, { id: 'textinput' }),
	d(createButton, { id: 'button', state: { label: 'Button' } })
];

projector.append().then(() => {
	console.log('projector is attached');
});
```

Using the `createProjector` as a base for a root widget:

```ts
import { DNode } from 'dojo-widgets/interfaces';
import d from 'dojo-widgets/d';
import createProjector, { Projector } from 'dojo-widgets/createProjector';
import createButton from 'dojo-widgets/components/button/createButton';
import createTextInput from 'dojo-widgets/components/textinput/createTextInput';

const createApp = createProjector.mixin({
	mixin: {
		getChildrenNodes: function(this: Projector): DNode[] {
			return [
				d(createTextInput, { id: 'textinput' }),
				d(createButton, { id: 'button', state: { label: 'Button' } })
			];
		},
		classes: [ 'main-app' ],
		tagName: 'main'
	}
});

export default createApp;
```
Using the custom widget assuming a class called `createApp.ts` relative to its usages:

```ts
import createApp from './createApp';

const app = createApp();

app.append().then(() => {
	console.log('projector is attached');
});
```

### Dojo Widget Components

A selection of core reusable widgets are provided for convenience that are fully accessible and open to internationalization.

// TODO - list core components here.

## How Do I Contribute?

We appreciate your interest!  Please see the [Dojo Meta Repository](https://github.com/dojo/meta#readme) for the
Contributing Guidelines and Style Guide.

### Installation

To start working with this package, clone the repository and run `npm install`.

In order to build the project run `grunt dev` or `grunt dist`.

### Testing

Test cases MUST be written using [Intern](https://theintern.github.io) using the Object test interface and Assert assertion interface.

90% branch coverage MUST be provided for all code submitted to this repository, as reported by istanbul’s combined coverage results for all supported platforms.

To test locally in node run:

`grunt test`

To test against browsers with a local selenium server run:

`grunt test:local`

To test against BrowserStack or Sauce Labs run:

`grunt test:browserstack`

or

`grunt test:saucelabs`

## Licensing Information

© 2016 [JS Foundation](https://js.foundation/). [New BSD](http://opensource.org/licenses/BSD-3-Clause) license.
