# Creating New Components

If your tool needs to interact with hypermedia entities in a way that isn't available in existing shared components, you can create a new component.

Most components will start off living in the [features](features) folder for rapid development.

## Basic Setup

```js
import { customHypermediaElement, html } from '@brightspace-hmc/foundation-engine/framework/hypermedia-components.js';
import { HypermediaStateMixin } from '@brightspace-hmc/foundation-engine/framework/hypermedia-lit-mixin.js';
import { LitElement } from 'lit-element/lit-element.js';

class CustomComponent extends HypermediaStateMixin(LitElement) {

  render() {
    return html`
      <div>Some custom stuff</div>
      <div>You could also include other foundation components in here!</div>
    `;
  }
}

// This line maps the 'd2l-activity-editor-main' tag to the new 'd2l-activity-editor-main-custom'
// tag when 'some-class' exists on the hypermedia entity
customHypermediaElement(
  'd2l-activity-editor-main-custom', // the tag for the new component
  CustomComponent, // the class of the component
  'd2l-activity-editor-main', // the base tag the component will resolve from
  [['some-class']] // the entity classes to determine when this component is used
);
```

### Determining When a Tag Will Load

Base tags like `d2l-activity-editor-main` resolve to other components based on the hypermedia classes on the entity. We can customize this logic using the following syntax:

- Add classes to an inner array to `AND` them.
- Add more arrays of classes to `OR` them.

A single class does not need to be wrapped in an array.

|Argument|Resolve when classes include|
|-|-|
|`[['learning-path']]`| `learning-path`|
|`'learning-path'`| `learning-path`|
|`[['activity-collection'], ['learning-path']]`| `activity-collection` OR `learning-path`|
|`[['activity-usage', 'course-offering']]`| `activity-usage` AND `course-offering`|
|`[['activity-usage', 'course-offering'], ['quiz']]`| (`activity-usage` AND `course-offering`) OR `quiz`|
|`[['activity-usage', 'course-offering'], 'quiz']`| (`activity-usage` AND `course-offering`) OR `quiz`|

Tag resolution will always use the most specific logic available; a component defined with a longer `AND` statement will be preferred over a component defined with a shorter statement.

**Example:** Two components are defined as follows:

- `component1` defined with class argument `[['foo', 'bar'], ['cherry', 'coke']]`
- `component2` defined with class argument `[['foo', 'bar', 'baz']], ['cherry']`

The entity associated with the `href` has classes `foo, bar, baz, cherry, coke, vanilla`. `component2` resolves based on the entity classes because `component2` has a longer matching `AND` statement.

### Registering

Most use cases will be shareable and the new components should be added to this repository in the `features` folder. Eventually, the components will be polished and moved to the `components` folder.

The new component **needs to be imported** in the base component. In this case, in `d2l-activity-editor-main.js`:

```js
// START custom component imports
import './features/my-feature/d2l-activity-editor-main-custom.js';
...
// END custom component imports
```

## Adding observables

Often, your component will want to observe specific information about an entity. We can do this by adding observable properties to the component.

```js
import { observableTypes } from '@brightspace-hmc/foundation-engine/framework/hypermedia-lit-mixin.js';
...

static get properties() {
  return {
    _organizationHref: { type: String, observable: observableTypes.link, rel: 'https://api.brightspace.com/rels/organization' }
  };
}
```

This will attach the organization `link` (based on the `rel` we pass) to our entity and update the component if it changes.

We can reference this observable to render more information.

```js
render() {
  return html`
    <d2l-hc-name href="${this._organizationHref}" .token="${this.token}"></d2l-hc-name>
  `;
}
```

The following is a summary of the observable types and routing. For more details, see [observables](https://github.com/BrightspaceHypermediaComponents/foundation-engine/tree/master/state/observable) in the [Foundation Engine](https://github.com/BrightspaceHypermediaComponents/foundation-engine).

### Observable Types

Types are based on Siren's hypermedia format.

- `classes`: classes on the entity
- `entity`: the entire parsed entity object associated with this href
- `link`: a string representing a link
- `property`: a simple property that's part of the entity
- `subEntity`: a parsed siren sub entity object
- `subEntities`: an array of parsed siren sub entities with the same `rel`

### Routing

Often, you may need information from linked entities. You can define observables that dig into nested entities using the `route` property.

The following will dig into the linked `specialization` to get the `name` property.

```js
static get properties() {
  return {
    specializationName: {
      type: String,
      observable: observableTypes.property, // the type of observable we are digging in to grab
      id: 'name', // defines the name of the property
      route: [{
        observable: observableTypes.link, // where the attached entity can be found
        rel: 'https://api.brightspace.com/rels/specialization'
      }]
    };
  };
}
```

The `id` is optional &mdash; if it doesn't exist, it will default to the name of the defined property with or without an underscore (i.e., 'specializationName' in this case).

**Nested** routing is supported. You can accomplish an infinite number of levels by simply adding more observable objects to the `route` array. This is particularly useful for getting information from sub-entities that don't have an `href` associated with them.

```js
static get properties() {
  return {
    orgUnit: {
      type: String,
      observable: observableTypes.property,
      route: [{
        observable: observableTypes.link,
        rel: 'https://api.brightspace.com/rels/assignment'
      }, {
        observable: observableTypes.subEntity,
        rel: 'https://assignments.api.brightspace.com/rels/instructions'
      }, {
        observable: observableTypes.subEntity,
        rel: 'https://api.brightspace.com/rels/richtext-editor-config'
      }]
    }
  };
}
```

## Performing Actions

Many components will need to alter the state of their entity. Let's see how performing an `update` action might work.

```js
import { observableTypes } from '@brightspace-hmc/foundation-engine/framework/hypermedia-lit-mixin.js';
...

static get properties() {
  return {
    // Gets the actual 'name' property from the linked specialization entity
    name: {
      type: String,
      observable: observableTypes.property,
      route: [{ observable: observableTypes.link, rel: 'https://api.brightspace.com/rels/specialization' }]
    },
    // Defines the action for updating the name
    updateName: {
      type: Object,
      observable: observableTypes.action,
      name: 'update-name',
      route: [{ observable: observableTypes.link, rel: 'https://api.brightspace.com/rels/specialization' }]
    }
  };
}
```

The `type` of an action property will **always** be `Object`. The `observable` should always be set to `action`. This snippet will dig into the linked `specialization` and get the action called 'update-name'. You can then interact with the action like so:

```js
onChangeName(e) {
  this.updateName.has? this.updateName.commit({
    name: { observable: observableTypes.property, value: e.target.value }
  });
}
```

This will **commit** the name change to the state with the provided value. Any other components listening to this part of the state will also update. However, the change has **not been sent to the server** just yet.

Committed actions are put in the **action queue**.

### Pushing the committed changes

To send all committed changes to the server, we will call `push` from elsewhere. This is done for you in the `d2l-activity-editor-footer`.

```js
render() {
  return html`
    <d2l-button primary @click="${this._onSaveClick}">Save and Close</d2l-button>
  `;
}

_onSaveClick() {
  this._state.push();
}
```
