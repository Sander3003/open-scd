import { LitElement, TemplateResult } from 'lit-element';
import { directive, Part } from 'lit-html';

import { List } from '@material/mwc-list';
import { Select } from '@material/mwc-select';
import { TextField } from '@material/mwc-textfield';
import AceEditor from 'ace-custom-element';

import { WizardTextField } from './wizard-textfield.js';
import { WizardSelect } from './wizard-select.js';

export type SimpleAction = Create | Update | Delete | Move;
export type ComplexAction = {
  actions: SimpleAction[];
  title: string;
  derived?: boolean;
};
/** Represents an intended or committed change to some `Element`. */
export type EditorAction = SimpleAction | ComplexAction;
/** Inserts `new.element` to `new.parent` before `new.reference`. */
export interface Create {
  new: { parent: Element; element: Element; reference: Node | null };
  derived?: boolean;
  checkValidity?: () => boolean;
}
/** Removes `old.element` from `old.parent` before `old.reference`. */
export interface Delete {
  old: { parent: Element; element: Element; reference: Node | null };
  derived?: boolean;
  checkValidity?: () => boolean;
}
/** Reparents of `old.element` to `new.parent` before `new.reference`. */
export interface Move {
  old: { parent: Element; element: Element; reference: Node | null };
  new: { parent: Element; reference: Node | null };
  derived?: boolean;
  checkValidity?: () => boolean;
}
/** Replaces `old.element` with `new.element`, keeping element children. */
export interface Update {
  old: { element: Element };
  new: { element: Element };
  derived?: boolean;
  checkValidity?: () => boolean;
}

export function isCreate(action: EditorAction): action is Create {
  return (
    (action as Update).old === undefined &&
    (action as Create).new?.parent !== undefined &&
    (action as Create).new?.element !== undefined &&
    (action as Create).new?.reference !== undefined
  );
}
export function isDelete(action: EditorAction): action is Delete {
  return (
    (action as Delete).old?.parent !== undefined &&
    (action as Delete).old?.element !== undefined &&
    (action as Delete).old?.reference !== undefined &&
    (action as Update).new === undefined
  );
}
export function isMove(action: EditorAction): action is Move {
  return (
    (action as Move).old?.parent !== undefined &&
    (action as Move).old?.element !== undefined &&
    (action as Move).old?.reference !== undefined &&
    (action as Move).new?.parent !== undefined &&
    (action as Update).new?.element == undefined &&
    (action as Move).new?.reference !== undefined
  );
}
export function isUpdate(action: EditorAction): action is Update {
  return (
    (action as Move).old?.parent === undefined &&
    (action as Update).old?.element !== undefined &&
    (action as Move).new?.parent === undefined &&
    (action as Update).new?.element !== undefined
  );
}
export function isSimple(action: EditorAction): action is SimpleAction {
  return !((<ComplexAction>action).actions instanceof Array);
}

/** @returns an [[`EditorAction`]] with opposite effect of `action`. */
export function invert(action: EditorAction): EditorAction {
  if (!isSimple(action)) {
    const inverse: ComplexAction = {
      title: action.title,
      derived: action.derived,
      actions: [],
    };
    action.actions.forEach(element =>
      inverse.actions.unshift(<SimpleAction>invert(element))
    );
    return inverse;
  }

  const metaData = {
    derived: action.derived,
    checkValidity: action.checkValidity,
  };
  if (isCreate(action)) return { old: action.new, ...metaData };
  else if (isDelete(action)) return { new: action.old, ...metaData };
  else if (isMove(action))
    return {
      old: {
        parent: action.new.parent,
        element: action.old.element,
        reference: action.new.reference,
      },
      new: { parent: action.old.parent, reference: action.old.reference },
      ...metaData,
    };
  else if (isUpdate(action))
    return { new: action.old, old: action.new, ...metaData };
  else return unreachable('Unknown EditorAction type in invert.');
}

/** Represents some intended modification of a `Document` being edited. */
export interface EditorActionDetail<T extends EditorAction> {
  action: T;
}
export type EditorActionEvent<T extends EditorAction> = CustomEvent<
  EditorActionDetail<T>
>;
export function newActionEvent<T extends EditorAction>(
  action: T,
  eventInitDict?: CustomEventInit<Partial<EditorActionDetail<T>>>
): EditorActionEvent<T> {
  return new CustomEvent<EditorActionDetail<T>>('editor-action', {
    bubbles: true,
    composed: true,
    ...eventInitDict,
    detail: { action, ...eventInitDict?.detail },
  });
}

export const wizardInputSelector =
  'wizard-textfield, mwc-textfield, ace-editor, mwc-select,wizard-select';
export type WizardInput =
  | WizardTextField
  | TextField
  | (AceEditor & { checkValidity: () => boolean; label: string })
  // TODO(c-dinkel): extend component
  | Select
  | WizardSelect;

export type WizardAction = EditorAction | (() => Wizard);

/** @returns [[`EditorAction`]]s to dispatch on [[`WizardDialog`]] commit. */
export type WizardActor = (
  inputs: WizardInput[],
  wizard: Element,
  list?: List | null
) => WizardAction[];

export function isWizard(
  wizardAction: WizardAction
): wizardAction is () => Wizard {
  return typeof wizardAction === 'function';
}

/** @returns the validity of `input` depending on type. */
export function checkValidity(input: WizardInput): boolean {
  if (input instanceof WizardTextField || input instanceof Select)
    return input.checkValidity();
  else return true;
}

/** reports the validity of `input` depending on type. */
export function reportValidity(input: WizardInput): boolean {
  if (input instanceof WizardTextField || input instanceof Select)
    return input.reportValidity();
  else return true;
}

/** @returns the `value` or `maybeValue` of `input` depending on type. */
export function getValue(input: WizardInput): string | null {
  if (input instanceof WizardTextField || input instanceof WizardSelect)
    return input.maybeValue;
  else return input.value ?? null;
}

/** @returns the `multiplier` of `input` if available. */
export function getMultiplier(input: WizardInput): string | null {
  if (input instanceof WizardTextField) return input.multiplier;
  else return null;
}

/** Represents a page of a wizard dialog */
export interface WizardPage {
  title: string;
  content?: TemplateResult[];
  primary?: {
    icon: string;
    label: string;
    action: WizardActor;
    auto?: boolean;
  };
  secondary?: {
    icon: string;
    label: string;
    action: WizardActor;
  };
  initial?: boolean;
  element?: Element;
}
export type Wizard = WizardPage[];

/** If `wizard === null`, close the current wizard, else queue `wizard`. */
export interface WizardDetail {
  wizard: Wizard | null;
  subwizard?: boolean;
}
export type WizardEvent = CustomEvent<WizardDetail>;
export function newWizardEvent(
  wizard: Wizard | null = null,
  eventInitDict?: CustomEventInit<Partial<WizardDetail>>
): WizardEvent {
  return new CustomEvent<WizardDetail>('wizard', {
    bubbles: true,
    composed: true,
    ...eventInitDict,
    detail: { wizard, ...eventInitDict?.detail },
  });
}

type InfoEntryKind = 'info' | 'warning' | 'error';

export type LogEntryType =
  | 'info'
  | 'warning'
  | 'error'
  | 'action'
  | 'reset'
  | 'sclhistory';

/** The basic information contained in each [[`LogEntry`]]. */
export interface LogDetailBase {
  title: string;
  message?: string;
}
/** The [[`LogEntry`]] for a committed [[`EditorAction`]]. */
export interface CommitDetail extends LogDetailBase {
  kind: 'action';
  action: EditorAction;
}
/** A [[`LogEntry`]] for notifying the user. */
export interface InfoDetail extends LogDetailBase {
  kind: InfoEntryKind;
  cause?: LogEntry;
}
/** A [[`LogEntry`]] create from the HItem Line (History) of the SCD File */
export interface SclhistoryDetail extends LogDetailBase {
  kind: 'sclhistory';
}

export interface ResetDetail {
  kind: 'reset';
}

export type LogDetail = InfoDetail | CommitDetail | ResetDetail;
export type LogEvent = CustomEvent<LogDetail>;
export function newLogEvent(
  detail: LogDetail,
  eventInitDict?: CustomEventInit<LogDetail>
): LogEvent {
  return new CustomEvent<LogDetail>('log', {
    bubbles: true,
    composed: true,
    ...eventInitDict,
    detail: { ...detail, ...eventInitDict?.detail },
  });
}

export interface IssueDetail extends LogDetailBase {
  validatorId: string;
  statusNumber: number;
}
export type IssueEvent = CustomEvent<IssueDetail>;
export function newIssueEvent(
  detail: IssueDetail,
  eventInitDict?: CustomEventInit<IssueDetail>
): IssueEvent {
  return new CustomEvent<IssueDetail>('issue', {
    bubbles: true,
    composed: true,
    ...eventInitDict,
    detail: { ...detail, ...eventInitDict?.detail },
  });
}

/** [[`LogEntry`]]s are timestamped upon being committed to the `history`. */
interface Timestamped {
  time: Date | null;
}

export type CommitEntry = Timestamped & CommitDetail;
export type InfoEntry = Timestamped & InfoDetail;
export type SclhistoryEntry = Timestamped & SclhistoryDetail;

export type LogEntry = InfoEntry | CommitEntry | SclhistoryEntry;

/** Represents some work pending completion, upon which `promise` resolves. */
export interface PendingStateDetail {
  promise: Promise<void>;
}
export type PendingStateEvent = CustomEvent<PendingStateDetail>;
export function newPendingStateEvent(
  promise: Promise<void>,
  eventInitDict?: CustomEventInit<Partial<PendingStateDetail>>
): PendingStateEvent {
  return new CustomEvent<PendingStateDetail>('pending-state', {
    bubbles: true,
    composed: true,
    ...eventInitDict,
    detail: { promise, ...eventInitDict?.detail },
  });
}

/** Represents a request for validation. */
export interface ValidateDetail {
  identity: string;
}
export type ValidateEvent = CustomEvent<ValidateDetail>;
export function newValidateEvent(
  identity = '',
  eventInitDict?: CustomEventInit<Partial<ValidateDetail>>
): ValidateEvent {
  return new CustomEvent<ValidateDetail>('validate', {
    bubbles: true,
    composed: true,
    ...eventInitDict,
    detail: { identity, ...eventInitDict?.detail },
  });
}

/** Represents a document to be opened. */
export interface OpenDocDetail {
  doc: XMLDocument;
  docName: string;
  docId?: string;
}
export type OpenDocEvent = CustomEvent<OpenDocDetail>;
export function newOpenDocEvent(
  doc: XMLDocument,
  docName: string,
  eventInitDict?: CustomEventInit<Partial<OpenDocDetail>>
): OpenDocEvent {
  return new CustomEvent<OpenDocDetail>('open-doc', {
    bubbles: true,
    composed: true,
    ...eventInitDict,
    detail: { doc, docName, ...eventInitDict?.detail },
  });
}

/** @returns a reference to `element` with segments delimited by '/'. */
// TODO(c-dinkel): replace with identity (FIXME)
export function referencePath(element: Element): string {
  let path = '';
  let nextParent: Element | null = element.parentElement;
  while (nextParent?.getAttribute('name')) {
    path = '/' + nextParent.getAttribute('name') + path;
    nextParent = nextParent.parentElement;
  }
  return path;
}

export function pathParts(identity: string): [string, string] {
  const path = identity.split('>');
  const end = path.pop() ?? '';
  const start = path.join('>');
  return [start, end];
}

const voidSelector = ':not(*)';

function hitemIdentity(e: Element): string {
  return `${e.getAttribute('version')}\t${e.getAttribute('revision')}`;
}

function hitemSelector(tagName: SCLTag, identity: string): string {
  const [version, revision] = identity.split('\t');

  if (!version || !revision) return voidSelector;

  return `${tagName}[version="${version}"][revision="${revision}"]`;
}

function terminalIdentity(e: Element): string {
  return identity(e.parentElement) + '>' + e.getAttribute('connectivityNode');
}

function terminalSelector(tagName: SCLTag, identity: string): string {
  const [parentIdentity, connectivityNode] = pathParts(identity);

  const parentSelectors = tags[tagName].parents.flatMap(parentTag =>
    selector(parentTag, parentIdentity).split(',')
  );

  return crossProduct(
    parentSelectors,
    ['>'],
    [`${tagName}[connectivityNode="${connectivityNode}"]`]
  )
    .map(strings => strings.join(''))
    .join(',');
}

function lNodeIdentity(e: Element): string {
  const [iedName, ldInst, prefix, lnClass, lnInst, lnType] = [
    'iedName',
    'ldInst',
    'prefix',
    'lnClass',
    'lnInst',
    'lnType',
  ].map(name => e.getAttribute(name));
  if (iedName === 'None')
    return `${identity(e.parentElement)}>(${lnClass} ${lnType})`;
  return `${iedName} ${ldInst || '(Client)'}/${prefix ?? ''} ${lnClass} ${
    lnInst ?? ''
  }`;
}

function lNodeSelector(tagName: SCLTag, identity: string): string {
  if (identity.endsWith(')')) {
    const [parentIdentity, childIdentity] = pathParts(identity);
    const [lnClass, lnType] = childIdentity
      .substring(1, identity.length - 2)
      .split(' ');

    if (!lnClass || !lnType) return voidSelector;

    return tags[tagName].parents
      .map(
        parentTag =>
          `${selector(
            parentTag,
            parentIdentity
          )}>${tagName}[iedName="None"][lnClass="${lnClass}"][lnType="${lnType}"]`
      )
      .join(',');
  }

  const [iedName, ldInst, prefix, lnClass, lnInst] = identity.split(/[ /]/);

  if (!iedName || !ldInst || !lnClass) return voidSelector;

  const [
    iedNameSelectors,
    ldInstSelectors,
    prefixSelectors,
    lnClassSelectors,
    lnInstSelectors,
  ] = [
    [`[iedName="${iedName}"]`],
    ldInst === '(Client)'
      ? [':not([ldInst])', '[ldInst=""]']
      : [`[ldInst="${ldInst}"]`],
    prefix ? [`[prefix="${prefix}"]`] : [':not([prefix])', '[prefix=""]'],
    [`[lnClass="${lnClass}"]`],
    lnInst ? [`[lnInst="${lnInst}"]`] : [':not([lnInst])', '[lnInst=""]'],
  ];

  return crossProduct(
    [tagName],
    iedNameSelectors,
    ldInstSelectors,
    prefixSelectors,
    lnClassSelectors,
    lnInstSelectors
  )
    .map(strings => strings.join(''))
    .join(',');
}

function kDCIdentity(e: Element): string {
  return `${identity(e.parentElement)}>${e.getAttribute(
    'iedName'
  )} ${e.getAttribute('apName')}`;
}

function kDCSelector(tagName: SCLTag, identity: string): string {
  const [parentIdentity, childIdentity] = pathParts(identity);
  const [iedName, apName] = childIdentity.split(' ');
  return `${selector(
    'IED',
    parentIdentity
  )}>${tagName}[iedName="${iedName}"][apName="${apName}"]`;
}

function associationIdentity(e: Element): string {
  return `${identity(e.parentElement)}>${e.getAttribute('associationID')}`;
}

function associationSelector(tagName: SCLTag, identity: string): string {
  const [parentIdentity, associationID] = pathParts(identity);

  if (!associationID) return voidSelector;

  return `${selector(
    'Server',
    parentIdentity
  )}>${tagName}[associationID="${associationID}"]`;
}

function lDeviceIdentity(e: Element): string {
  return `${identity(e.closest('IED')!)}>>${e.getAttribute('inst')}`;
}

function lDeviceSelector(tagName: SCLTag, identity: string): string {
  const [iedName, inst] = identity.split('>>');

  if (!inst) return voidSelector;

  return `IED[name="${iedName}"] ${tagName}[inst="${inst}"]`;
}

function iEDNameIdentity(e: Element): string {
  const iedName = e.textContent;
  const [apRef, ldInst, prefix, lnClass, lnInst] = [
    'apRef',
    'ldInst',
    'prefix',
    'lnClass',
    'lnInst',
  ].map(name => e.getAttribute(name));
  return `${identity(e.parentElement)}>${iedName} ${apRef ? apRef : ''} ${
    ldInst ? ldInst : ''
  }/${prefix ?? ''} ${lnClass ?? ''} ${lnInst ?? ''}`;
}

function iEDNameSelector(tagName: SCLTag, identity: string): string {
  const [parentIdentity, childIdentity] = pathParts(identity);

  const [iedName, apRef, ldInst, prefix, lnClass, lnInst] =
    childIdentity.split(/[ /]/);

  const [
    parentSelectors,
    apRefSelectors,
    ldInstSelectors,
    prefixSelectors,
    lnClassSelectors,
    lnInstSelectors,
  ] = [
    tags[tagName].parents.flatMap(parentTag =>
      selector(parentTag, parentIdentity).split(',')
    ),
    [`${iedName}`],
    apRef ? [`[apRef="${apRef}"]`] : [':not([apRef])', '[apRef=""]'],
    ldInst ? [`[ldInst="${ldInst}"]`] : [':not([ldInst])', '[ldInst=""]'],
    prefix ? [`[prefix="${prefix}"]`] : [':not([prefix])', '[prefix=""]'],
    [`[lnClass="${lnClass}"]`],
    lnInst ? [`[lnInst="${lnInst}"]`] : [':not([lnInst])', '[lnInst=""]'],
  ];

  return crossProduct(
    parentSelectors,
    ['>'],
    [tagName],
    apRefSelectors,
    ldInstSelectors,
    prefixSelectors,
    lnClassSelectors,
    lnInstSelectors
  )
    .map(strings => strings.join(''))
    .join(',');
}

function fCDAIdentity(e: Element): string {
  const [ldInst, prefix, lnClass, lnInst, doName, daName, fc, ix] = [
    'ldInst',
    'prefix',
    'lnClass',
    'lnInst',
    'doName',
    'daName',
    'fc',
    'ix',
  ].map(name => e.getAttribute(name));
  const dataPath = `${ldInst}/${prefix ?? ''} ${lnClass} ${
    lnInst ?? ''
  }.${doName} ${daName ? daName : ''}`;
  return `${identity(e.parentElement)}>${dataPath} (${fc}${
    ix ? ' [' + ix + ']' : ''
  })`;
}

function fCDASelector(tagName: SCLTag, identity: string): string {
  const [parentIdentity, childIdentity] = pathParts(identity);

  const [ldInst, prefix, lnClass, lnInst] = childIdentity.split(/[ /.]/);

  const matchDoDa = childIdentity.match(
    /.([A-Z][a-z0-9.]*) ([A-Za-z0-9.]*) \(/
  );
  const doName = matchDoDa && matchDoDa[1] ? matchDoDa[1] : '';
  const daName = matchDoDa && matchDoDa[2] ? matchDoDa[2] : '';

  const matchFx = childIdentity.match(/\(([A-Z]{2})/);
  const matchIx = childIdentity.match(/ \[([0-9]{1,2})\]/);

  const fc = matchFx && matchFx[1] ? matchFx[1] : '';
  const ix = matchIx && matchIx[1] ? matchIx[1] : '';

  const [
    parentSelectors,
    ldInstSelectors,
    prefixSelectors,
    lnClassSelectors,
    lnInstSelectors,
    doNameSelectors,
    daNameSelectors,
    fcSelectors,
    ixSelectors,
  ] = [
    tags[tagName].parents.flatMap(parentTag =>
      selector(parentTag, parentIdentity).split(',')
    ),
    [`[ldInst="${ldInst}"]`],
    prefix ? [`[prefix="${prefix}"]`] : [':not([prefix])', '[prefix=""]'],
    [`[lnClass="${lnClass}"]`],
    lnInst ? [`[lnInst="${lnInst}"]`] : [':not([lnInst])', '[lnInst=""]'],
    [`[doName="${doName}"]`],
    daName ? [`[daName="${daName}"]`] : [':not([daName])', '[daName=""]'],
    [`[fc="${fc}"]`],
    ix ? [`[ix="${ix}"]`] : [':not([ix])', '[ix=""]'],
  ];

  return crossProduct(
    parentSelectors,
    ['>'],
    [tagName],
    ldInstSelectors,
    prefixSelectors,
    lnClassSelectors,
    lnInstSelectors,
    doNameSelectors,
    daNameSelectors,
    fcSelectors,
    ixSelectors
  )
    .map(strings => strings.join(''))
    .join(',');
}

function extRefIdentity(e: Element): string | number {
  if (!e.parentElement) return NaN;
  const parentIdentity = identity(e.parentElement);
  const iedName = e.getAttribute('iedName');
  const intAddr = e.getAttribute('intAddr');
  const intAddrIndex = Array.from(
    e.parentElement.querySelectorAll(`ExtRef[intAddr="${intAddr}"]`)
  ).indexOf(e);
  if (!iedName) return `${parentIdentity}>${intAddr}[${intAddrIndex}]`;
  const [
    ldInst,
    prefix,
    lnClass,
    lnInst,
    doName,
    daName,
    serviceType,
    srcLDInst,
    srcPrefix,
    srcLNClass,
    srcLNInst,
    srcCBName,
  ] = [
    'ldInst',
    'prefix',
    'lnClass',
    'lnInst',
    'doName',
    'daName',
    'serviceType',
    'srcLDInst',
    'srcPrefix',
    'srcLNClass',
    'srcLNInst',
    'srcCBName',
  ].map(name => e.getAttribute(name));

  const cbPath = srcCBName
    ? `${serviceType}:${srcCBName} ${srcLDInst ?? ''}/${
        srcPrefix ?? ''
      } ${srcLNClass} ${srcLNInst ?? ''}`
    : '';
  const dataPath = `${iedName} ${ldInst}/${prefix ?? ''} ${lnClass} ${
    lnInst ?? ''
  } ${doName} ${daName ? daName : ''}`;
  return `${parentIdentity}>${cbPath} ${dataPath}${
    intAddr ? '@' + `${intAddr}` : ''
  }`;
}

function extRefSelector(tagName: SCLTag, identity: string): string {
  const [parentIdentity, childIdentity] = pathParts(identity);

  const parentSelectors = tags[tagName].parents.flatMap(parentTag =>
    selector(parentTag, parentIdentity).split(',')
  );

  if (childIdentity.endsWith(']')) {
    const [intAddr] = childIdentity.split('[');
    const intAddrSelectors = [`[intAddr="${intAddr}"]`];

    return crossProduct(parentSelectors, ['>'], [tagName], intAddrSelectors)
      .map(strings => strings.join(''))
      .join(',');
  }

  let iedName,
    ldInst,
    prefix,
    lnClass,
    lnInst,
    doName,
    daName,
    serviceType,
    srcCBName,
    srcLDInst,
    srcPrefix,
    srcLNClass,
    srcLNInst,
    intAddr;

  if (!childIdentity.includes(':') && !childIdentity.includes('@')) {
    [iedName, ldInst, prefix, lnClass, lnInst, doName, daName] =
      childIdentity.split(/[ /]/);
  } else if (childIdentity.includes(':') && !childIdentity.includes('@')) {
    [
      serviceType,
      srcCBName,
      srcLDInst,
      srcPrefix,
      srcLNClass,
      srcLNInst,
      iedName,
      ldInst,
      prefix,
      lnClass,
      lnInst,
      doName,
      daName,
    ] = childIdentity.split(/[ /:]/);
  } else if (!childIdentity.includes(':') && childIdentity.includes('@')) {
    [iedName, ldInst, prefix, lnClass, lnInst, doName, daName, intAddr] =
      childIdentity.split(/[ /@]/);
  } else {
    [
      serviceType,
      srcCBName,
      srcLDInst,
      srcPrefix,
      srcLNClass,
      srcLNInst,
      iedName,
      ldInst,
      prefix,
      lnClass,
      lnInst,
      doName,
      daName,
      intAddr,
    ] = childIdentity.split(/[ /:@]/);
  }

  const [
    iedNameSelectors,
    ldInstSelectors,
    prefixSelectors,
    lnClassSelectors,
    lnInstSelectors,
    doNameSelectors,
    daNameSelectors,
    serviceTypeSelectors,
    srcCBNameSelectors,
    srcLDInstSelectors,
    srcPrefixSelectors,
    srcLNClassSelectors,
    srcLNInstSelectors,
    intAddrSelectors,
  ] = [
    iedName ? [`[iedName="${iedName}"]`] : [':not([iedName])'],
    ldInst ? [`[ldInst="${ldInst}"]`] : [':not([ldInst])', '[ldInst=""]'],
    prefix ? [`[prefix="${prefix}"]`] : [':not([prefix])', '[prefix=""]'],
    lnClass ? [`[lnClass="${lnClass}"]`] : [':not([lnClass])'],
    lnInst ? [`[lnInst="${lnInst}"]`] : [':not([lnInst])', '[lnInst=""]'],
    doName ? [`[doName="${doName}"]`] : [':not([doName])'],
    daName ? [`[daName="${daName}"]`] : [':not([daName])', '[daName=""]'],
    serviceType
      ? [`[serviceType="${serviceType}"]`]
      : [':not([serviceType])', '[serviceType=""]'],
    srcCBName
      ? [`[srcCBName="${srcCBName}"]`]
      : [':not([srcCBName])', '[srcCBName=""]'],
    srcLDInst
      ? [`[srcLDInst="${srcLDInst}"]`]
      : [':not([srcLDInst])', '[srcLDInst=""]'],
    srcPrefix
      ? [`[srcPrefix="${srcPrefix}"]`]
      : [':not([srcPrefix])', '[srcPrefix=""]'],
    srcLNClass
      ? [`[srcLNClass="${srcLNClass}"]`]
      : [':not([srcLNClass])', '[srcLNClass=""]'],
    srcLNInst
      ? [`[srcLNInst="${srcLNInst}"]`]
      : [':not([srcLNInst])', '[srcLNInst=""]'],
    intAddr ? [`[intAddr="${intAddr}"]`] : [':not([intAddr])', '[intAddr=""]'],
  ];

  return crossProduct(
    parentSelectors,
    ['>'],
    [tagName],
    iedNameSelectors,
    ldInstSelectors,
    prefixSelectors,
    lnClassSelectors,
    lnInstSelectors,
    doNameSelectors,
    daNameSelectors,
    serviceTypeSelectors,
    srcCBNameSelectors,
    srcLDInstSelectors,
    srcPrefixSelectors,
    srcLNClassSelectors,
    srcLNInstSelectors,
    intAddrSelectors
  )
    .map(strings => strings.join(''))
    .join(',');
}

function lNIdentity(e: Element): string {
  const [prefix, lnClass, inst] = ['prefix', 'lnClass', 'inst'].map(name =>
    e.getAttribute(name)
  );
  return `${identity(e.parentElement)}>${prefix ?? ''} ${lnClass} ${inst}`;
}

function lNSelector(tagName: SCLTag, identity: string): string {
  const [parentIdentity, childIdentity] = pathParts(identity);

  const parentSelectors = tags[tagName].parents.flatMap(parentTag =>
    selector(parentTag, parentIdentity).split(',')
  );

  const [prefix, lnClass, inst] = childIdentity.split(' ');

  if (!lnClass) return voidSelector;

  const [prefixSelectors, lnClassSelectors, instSelectors] = [
    prefix ? [`[prefix="${prefix}"]`] : [':not([prefix])', '[prefix=""]'],
    [`[lnClass="${lnClass}"]`],
    [`[inst="${inst}"]`],
  ];

  return crossProduct(
    parentSelectors,
    ['>'],
    [tagName],
    prefixSelectors,
    lnClassSelectors,
    instSelectors
  )
    .map(strings => strings.join(''))
    .join(',');
}

function clientLNIdentity(e: Element): string {
  const [apRef, iedName, ldInst, prefix, lnClass, lnInst] = [
    'apRef',
    'iedName',
    'ldInst',
    'prefix',
    'lnClass',
    'lnInst',
  ].map(name => e.getAttribute(name));
  return `${identity(e.parentElement)}>${iedName} ${
    apRef ? apRef : ''
  } ${ldInst}/${prefix ?? ''} ${lnClass} ${lnInst}`;
}

function clientLNSelector(tagName: SCLTag, identity: string): string {
  const [parentIdentity, childIdentity] = pathParts(identity);

  const parentSelectors = tags[tagName].parents.flatMap(parentTag =>
    selector(parentTag, parentIdentity).split(',')
  );

  const [iedName, apRef, ldInst, prefix, lnClass, lnInst] =
    childIdentity.split(/[ /]/);

  const [
    iedNameSelectors,
    apRefSelectors,
    ldInstSelectors,
    prefixSelectors,
    lnClassSelectors,
    lnInstSelectors,
  ] = [
    iedName ? [`[iedName="${iedName}"]`] : [':not([iedName])', '[iedName=""]'],
    apRef ? [`[apRef="${apRef}"]`] : [':not([apRef])', '[apRef=""]'],
    ldInst ? [`[ldInst="${ldInst}"]`] : [':not([ldInst])', '[ldInst=""]'],
    prefix ? [`[prefix="${prefix}"]`] : [':not([prefix])', '[prefix=""]'],
    [`[lnClass="${lnClass}"]`],
    lnInst ? [`[lnInst="${lnInst}"]`] : [':not([lnInst])', '[lnInst=""]'],
  ];

  return crossProduct(
    parentSelectors,
    ['>'],
    [tagName],
    iedNameSelectors,
    apRefSelectors,
    ldInstSelectors,
    prefixSelectors,
    lnClassSelectors,
    lnInstSelectors
  )
    .map(strings => strings.join(''))
    .join(',');
}

function ixNamingIdentity(e: Element): string {
  const [name, ix] = ['name', 'ix'].map(name => e.getAttribute(name));
  return `${identity(e.parentElement)}>${name}${ix ? '[' + ix + ']' : ''}`;
}

function ixNamingSelector(
  tagName: SCLTag,
  identity: string,
  depth = -1
): string {
  if (depth === -1) depth = identity.split('>').length;

  const [parentIdentity, childIdentity] = pathParts(identity);

  const [_0, name, _1, ix] =
    childIdentity.match(/([^[]*)(\[([0-9]*)\])?/) ?? [];

  if (!name) return voidSelector;

  if (depth === 0) return `${tagName}[name="${name}"]`;

  const parentSelectors = tags[tagName].parents
    .flatMap(parentTag =>
      parentTag === 'SDI'
        ? ixNamingSelector(parentTag, parentIdentity, depth - 1).split(',')
        : selector(parentTag, parentIdentity).split(',')
    )
    .filter(selector => !selector.startsWith(voidSelector));

  if (parentSelectors.length === 0) return voidSelector;

  const [nameSelectors, ixSelectors] = [
    [`[name="${name}"]`],
    ix ? [`[ix="${ix}"]`] : ['[ix=""]', ':not([ix])'],
  ];

  return crossProduct(
    parentSelectors,
    ['>'],
    [tagName],
    nameSelectors,
    ixSelectors
  )
    .map(strings => strings.join(''))
    .join(',');
}

function valIdentity(e: Element): string | number {
  if (!e.parentElement) return NaN;
  const sGroup = e.getAttribute('sGroup');
  const index = Array.from(e.parentElement.children)
    .filter(child => child.getAttribute('sGroup') === sGroup)
    .findIndex(child => child.isSameNode(e));
  return `${identity(e.parentElement)}>${sGroup ? sGroup + '.' : ''} ${index}`;
}

function valSelector(tagName: SCLTag, identity: string): string {
  const [parentIdentity, childIdentity] = pathParts(identity);

  const [sGroup, indexText] = childIdentity.split(' ');
  const index = parseFloat(indexText);

  const parentSelectors = tags[tagName].parents.flatMap(parentTag =>
    selector(parentTag, parentIdentity).split(',')
  );

  const [nameSelectors, ixSelectors] = [
    sGroup ? [`[sGroup="${sGroup}"]`] : [''],
    index ? [`:nth-child(${index + 1})`] : [''],
  ];

  return crossProduct(
    parentSelectors,
    ['>'],
    [tagName],
    nameSelectors,
    ixSelectors
  )
    .map(strings => strings.join(''))
    .join(',');
}

function connectedAPIdentity(e: Element): string {
  const [iedName, apName] = ['iedName', 'apName'].map(name =>
    e.getAttribute(name)
  );
  return `${iedName} ${apName}`;
}

function connectedAPSelector(tagName: SCLTag, identity: string): string {
  const [iedName, apName] = identity.split(' ');
  if (!iedName || !apName) return voidSelector;
  return `${tagName}[iedName="${iedName}"][apName="${apName}"]`;
}

function controlBlockIdentity(e: Element): string {
  const [ldInst, cbName] = ['ldInst', 'cbName'].map(name =>
    e.getAttribute(name)
  );
  return `${ldInst} ${cbName}`;
}

function controlBlockSelector(tagName: SCLTag, identity: string): string {
  const [ldInst, cbName] = identity.split(' ');

  if (!ldInst || !cbName) return voidSelector;

  return `${tagName}[ldInst="${ldInst}"][cbName="${cbName}"]`;
}

function physConnIdentity(e: Element): string | number {
  if (!e.parentElement) return NaN;
  if (!e.parentElement.querySelector('PhysConn[type="RedConn"]')) return NaN;
  const pcType = e.getAttribute('type');
  if (
    e.parentElement.children.length > 1 &&
    pcType !== 'Connection' &&
    pcType !== 'RedConn'
  )
    return NaN;
  return `${identity(e.parentElement)}>${pcType}`;
}

function physConnSelector(tagName: SCLTag, identity: string): string {
  const [parentIdentity, pcType] = pathParts(identity);

  const [parentSelectors, typeSelectors] = [
    tags[tagName].parents.flatMap(parentTag =>
      selector(parentTag, parentIdentity).split(',')
    ),
    pcType ? [`[type="${pcType}"]`] : [''],
  ];

  return crossProduct(parentSelectors, ['>'], [tagName], typeSelectors)
    .map(strings => strings.join(''))
    .join(',');
}

function pIdentity(e: Element): string | number {
  if (!e.parentElement) return NaN;
  const eParent = e.parentElement;
  const eType = e.getAttribute('type');
  if (eParent.tagName === 'PhysConn')
    return `${identity(e.parentElement)}>${eType}`;
  const index = Array.from(e.parentElement.children)
    .filter(child => child.getAttribute('type') === eType)
    .findIndex(child => child.isSameNode(e));
  return `${identity(e.parentElement)}>${eType} [${index}]`;
}

function pSelector(tagName: SCLTag, identity: string): string {
  const [parentIdentity, childIdentity] = pathParts(identity);

  const [type] = childIdentity.split(' ');
  const index =
    childIdentity &&
    childIdentity.match(/\[([0-9]+)\]/) &&
    childIdentity.match(/\[([0-9]+)\]/)![1]
      ? parseFloat(childIdentity.match(/\[([0-9]+)\]/)![1])
      : NaN;

  const [parentSelectors, typeSelectors, ixSelectors] = [
    tags[tagName].parents.flatMap(parentTag =>
      selector(parentTag, parentIdentity).split(',')
    ),
    [`[type="${type}"]`],
    index ? [`:nth-child(${index + 1})`] : [''],
  ];

  return crossProduct(
    parentSelectors,
    ['>'],
    [tagName],
    typeSelectors,
    ixSelectors
  )
    .map(strings => strings.join(''))
    .join(',');
}

function enumValIdentity(e: Element): string {
  return `${identity(e.parentElement)}>${e.getAttribute('ord')}`;
}

function enumValSelector(tagName: SCLTag, identity: string): string {
  const [parentIdentity, ord] = pathParts(identity);
  return `${selector('EnumType', parentIdentity)}>${tagName}[ord="${ord}"]`;
}

function protNsIdentity(e: Element): string {
  return `${identity(e.parentElement)}>${e.getAttribute('type') || '8-MMS'}\t${
    e.textContent
  }`;
}

function protNsSelector(tagName: SCLTag, identity: string): string {
  const [parentIdentity, childIdentity] = pathParts(identity);

  const [type, value] = childIdentity.split('\t');

  const [parentSelectors] = [
    tags[tagName].parents.flatMap(parentTag =>
      selector(parentTag, parentIdentity).split(',')
    ),
  ];

  return crossProduct(
    parentSelectors,
    ['>'],
    [tagName],
    [`[type="${type}"]`],
    ['>'],
    [value]
  )
    .map(strings => strings.join(''))
    .join(',');
}

function sCLIdentity(): string {
  return '';
}

function sCLSelector(): string {
  return 'SCL';
}

function namingIdentity(e: Element): string {
  return e.parentElement!.tagName === 'SCL'
    ? e.getAttribute('name')!
    : `${identity(e.parentElement)}>${e.getAttribute('name')}`;
}

function namingSelector(tagName: SCLTag, identity: string, depth = -1): string {
  if (depth === -1) depth = identity.split('>').length;

  const [parentIdentity, name] = pathParts(identity);
  if (!name) return voidSelector;
  if (depth === 0) return `${tagName}[name="${name}"]`;

  const parents = tags[tagName].parents;
  if (!parents) return voidSelector;

  const parentSelectors = parents
    .flatMap(parentTag =>
      tags[parentTag].selector === tags['Substation'].selector
        ? namingSelector(parentTag, parentIdentity, depth - 1).split(',')
        : selector(parentTag, parentIdentity).split(',')
    )
    .filter(selector => !selector.startsWith(voidSelector));

  if (parentSelectors.length === 0) return voidSelector;

  return crossProduct(parentSelectors, ['>'], [tagName], [`[name="${name}"]`])
    .map(strings => strings.join(''))
    .join(',');
}

function singletonIdentity(e: Element): string {
  return identity(e.parentElement).toString();
}

function singletonSelector(tagName: SCLTag, identity: string): string {
  const parents = tags[tagName].parents;
  if (!parents) return voidSelector;

  const parentSelectors = parents
    .flatMap(parentTag => selector(parentTag, identity).split(','))
    .filter(selector => !selector.startsWith(voidSelector));

  if (parentSelectors.length === 0) return voidSelector;

  return crossProduct(parentSelectors, ['>'], [tagName])
    .map(strings => strings.join(''))
    .join(',');
}

function idNamingIdentity(e: Element): string {
  return `#${e.id}`;
}

function idNamingSelector(tagName: SCLTag, identity: string): string {
  const id = identity.replace(/^#/, '');

  if (!id) return voidSelector;

  return `${tagName}[id="${id}"]`;
}

type IdentityFunction = (e: Element) => string | number;
type SelectorFunction = (tagName: SCLTag, identity: string) => string;

const tAbstractConductingEquipment = [
  'TransformerWinding',
  'ConductingEquipment',
] as const;

const tEquipment = [
  'GeneralEquipment',
  'PowerTransformer',
  ...tAbstractConductingEquipment,
] as const;
const tEquipmentContainer = ['Substation', 'VoltageLevel', 'Bay'] as const;
const tGeneralEquipmentContainer = ['Process', 'Line'] as const;
const tAbstractEqFuncSubFunc = ['EqSubFunction', 'EqFunction'] as const;

const tPowerSystemResource = [
  'SubFunction',
  'Function',
  'TapChanger',
  'SubEquipment',
  ...tEquipment,
  ...tEquipmentContainer,
  ...tGeneralEquipmentContainer,
  ...tAbstractEqFuncSubFunc,
] as const;
const tLNodeContainer = ['ConnectivityNode', ...tPowerSystemResource] as const;
const tCertificate = ['GOOSESecurity', 'SMVSecurity'] as const;
const tNaming = ['SubNetwork', ...tCertificate, ...tLNodeContainer] as const;

const tAbstractDataAttribute = ['BDA', 'DA'] as const;
const tControlWithIEDName = ['SampledValueControl', 'GSEControl'] as const;
const tControlWithTriggerOpt = ['LogControl', 'ReportControl'] as const;
const tControl = [...tControlWithIEDName, ...tControlWithTriggerOpt] as const;
const tControlBlock = ['GSE', 'SMV'] as const;
const tUnNaming = [
  'ConnectedAP',
  'PhysConn',
  'SDO',
  'DO',
  'DAI',
  'SDI',
  'DOI',
  'Inputs',
  'RptEnabled',
  'Server',
  'ServerAt',
  'SettingControl',
  'Communication',
  'Log',
  'LDevice',
  'DataSet',
  'AccessPoint',
  'IED',
  'NeutralPoint',
  ...tControl,
  ...tControlBlock,
  ...tAbstractDataAttribute,
] as const;

const tAnyLN = ['LN0', 'LN'] as const;

const tAnyContentFromOtherNamespace = [
  'Text',
  'Private',
  'Hitem',
  'AccessControl',
] as const;

const tCert = ['Subject', 'IssuerName'] as const;
const tDurationInMilliSec = ['MinTime', 'MaxTime'] as const;

const tIDNaming = ['LNodeType', 'DOType', 'DAType', 'EnumType'] as const;

const tServiceYesNo = [
  'FileHandling',
  'TimeSyncProt',
  'CommProt',
  'SGEdit',
  'ConfSG',
  'GetDirectory',
  'GetDataObjectDefinition',
  'DataObjectDirectory',
  'GetDataSetValue',
  'SetDataSetValue',
  'DataSetDirectory',
  'ReadWrite',
  'TimerActivatedControl',
  'GetCBValues',
  'GSEDir',
  'ConfLdName',
] as const;

const tServiceWithMaxAndMaxAttributes = ['DynDataSet', 'ConfDataSet'] as const;

const tServiceWithMax = [
  'GSSE',
  'GOOSE',
  'ConfReportControl',
  'SMVsc',
  ...tServiceWithMaxAndMaxAttributes,
] as const;

const tServiceWithMaxNonZero = ['ConfLogControl', 'ConfSigRef'] as const;

const tServiceSettings = [
  'ReportSettings',
  'LogSettings',
  'GSESettings',
  'SMVSettings',
] as const;

const tBaseElement = ['SCL', ...tNaming, ...tUnNaming, ...tIDNaming] as const;

const sCLTags = [
  ...tBaseElement,
  ...tAnyContentFromOtherNamespace,
  'Header',
  'LNode',
  'Val',
  'Voltage',
  'Services',
  ...tCert,
  ...tDurationInMilliSec,
  'Association',
  'FCDA',
  'ClientLN',
  'IEDName',
  'ExtRef',
  'Protocol',
  ...tAnyLN,
  ...tServiceYesNo,
  'DynAssociation',
  'SettingGroups',
  ...tServiceWithMax,
  ...tServiceWithMaxNonZero,
  ...tServiceSettings,
  'ConfLNs',
  'ClientServices',
  'SupSubscription',
  'ValueHandling',
  'RedProt',
  'McSecurity',
  'KDC',
  'Address',
  'P',
  'ProtNs',
  'EnumVal',
  'Terminal',
  'BitRate',
  'Authentication',
  'DataTypeTemplates',
  'History',
  'OptFields',
  'SmvOpts',
  'TrgOps',
  'SamplesPerSec',
  'SmpRate',
  'SecPerSamples',
] as const;

export type SCLTag = typeof sCLTags[number];

const tagSet = new Set<string>(sCLTags);

function isSCLTag(tag: string): tag is SCLTag {
  return tagSet.has(tag);
}

const tBaseNameSequence = ['Text', 'Private'] as const;
const tNamingSequence = [...tBaseNameSequence] as const;
const tUnNamingSequence = [...tBaseNameSequence] as const;
const tIDNamingSequence = [...tBaseNameSequence] as const;

const tAbstractDataAttributeSequence = [...tUnNamingSequence, 'Val'] as const;
const tLNodeContainerSequence = [...tNamingSequence, 'LNode'] as const;
const tPowerSystemResourceSequence = [...tLNodeContainerSequence] as const;
const tEquipmentSequence = [...tPowerSystemResourceSequence] as const;
const tEquipmentContainerSequence = [
  ...tPowerSystemResourceSequence,
  'PowerTransformer',
  'GeneralEquipment',
] as const;
const tAbstractConductingEquipmentSequence = [
  ...tEquipmentSequence,
  'Terminal',
] as const;
const tControlBlockSequence = [...tUnNamingSequence, 'Address'] as const;
const tControlSequence = [...tNamingSequence] as const;
const tControlWithIEDNameSequence = [...tControlSequence, 'IEDName'] as const;
const tAnyLNSequence = [
  ...tUnNamingSequence,
  'DataSet',
  'ReportControl',
  'LogControl',
  'DOI',
  'Inputs',
  'Log',
] as const;
const tGeneralEquipmentContainerSequence = [
  ...tPowerSystemResourceSequence,
  'GeneralEquipment',
  'Function',
] as const;
const tControlWithTriggerOptSequence = [...tControlSequence, 'TrgOps'] as const;
const tAbstractEqFuncSubFuncSequence = [
  ...tPowerSystemResourceSequence,
  'GeneralEquipment',
  'EqSubFunction',
] as const;

export const tags: Record<
  SCLTag,
  {
    identity: IdentityFunction;
    selector: SelectorFunction;
    parents: SCLTag[];
    children: SCLTag[];
  }
> = {
  AccessControl: {
    identity: singletonIdentity,
    selector: singletonSelector,
    parents: ['LDevice'],
    children: [],
  },
  AccessPoint: {
    identity: namingIdentity,
    selector: namingSelector,
    parents: ['IED'],
    children: [
      ...tNamingSequence,
      'Server',
      'LN',
      'ServerAt',
      'Services',
      'GOOSESecurity',
      'SMVSecurity',
    ],
  },
  Address: {
    identity: singletonIdentity,
    selector: singletonSelector,
    parents: ['ConnectedAP', 'GSE', 'SMV'],
    children: ['P'],
  },
  Association: {
    identity: associationIdentity,
    selector: associationSelector,
    parents: ['Server'],
    children: [],
  },
  Authentication: {
    identity: singletonIdentity,
    selector: singletonSelector,
    parents: ['Server'],
    children: [],
  },
  BDA: {
    identity: namingIdentity,
    selector: namingSelector,
    parents: ['DAType'],
    children: [...tAbstractDataAttributeSequence],
  },
  BitRate: {
    identity: singletonIdentity,
    selector: singletonSelector,
    parents: ['SubNetwork'],
    children: [],
  },
  Bay: {
    identity: namingIdentity,
    selector: namingSelector,
    parents: ['VoltageLevel'],
    children: [
      ...tEquipmentContainerSequence,
      'ConductingEquipment',
      'ConnectivityNode',
      'Function',
    ],
  },
  ClientLN: {
    identity: clientLNIdentity,
    selector: clientLNSelector,
    parents: ['RptEnabled'],
    children: [],
  },
  ClientServices: {
    identity: singletonIdentity,
    selector: singletonSelector,
    parents: ['Services'],
    children: ['TimeSyncProt', 'McSecurity'],
  },
  CommProt: {
    identity: singletonIdentity,
    selector: singletonSelector,
    parents: ['Services'],
    children: [],
  },
  Communication: {
    identity: singletonIdentity,
    selector: singletonSelector,
    parents: ['SCL'],
    children: [...tUnNamingSequence, 'SubNetwork'],
  },
  ConductingEquipment: {
    identity: namingIdentity,
    selector: namingSelector,
    parents: ['Process', 'Line', 'SubFunction', 'Function', 'Bay'],
    children: [...tAbstractConductingEquipmentSequence, 'EqFunction'],
  },
  ConfDataSet: {
    identity: singletonIdentity,
    selector: singletonSelector,
    parents: ['Services'],
    children: [],
  },
  ConfLdName: {
    identity: singletonIdentity,
    selector: singletonSelector,
    parents: ['Services'],
    children: [],
  },
  ConfLNs: {
    identity: singletonIdentity,
    selector: singletonSelector,
    parents: ['Services'],
    children: [],
  },
  ConfLogControl: {
    identity: singletonIdentity,
    selector: singletonSelector,
    parents: ['Services'],
    children: [],
  },
  ConfReportControl: {
    identity: singletonIdentity,
    selector: singletonSelector,
    parents: ['Services'],
    children: [],
  },
  ConfSG: {
    identity: singletonIdentity,
    selector: singletonSelector,
    parents: ['SettingGroups'],
    children: [],
  },
  ConfSigRef: {
    identity: singletonIdentity,
    selector: singletonSelector,
    parents: ['Services'],
    children: [],
  },
  ConnectedAP: {
    identity: connectedAPIdentity,
    selector: connectedAPSelector,
    parents: ['SubNetwork'],
    children: [...tUnNamingSequence, 'Address', 'GSE', 'SMV', 'PhysConn'],
  },
  ConnectivityNode: {
    identity: namingIdentity,
    selector: namingSelector,
    parents: ['Bay', 'Line'],
    children: [...tLNodeContainerSequence],
  },
  DA: {
    identity: namingIdentity,
    selector: namingSelector,
    parents: ['DOType'],
    children: [...tAbstractDataAttributeSequence],
  },
  DAI: {
    identity: ixNamingIdentity,
    selector: ixNamingSelector,
    parents: ['DOI', 'SDI'],
    children: [...tUnNamingSequence, 'Val'],
  },
  DAType: {
    identity: idNamingIdentity,
    selector: idNamingSelector,
    parents: ['DataTypeTemplates'],
    children: [...tIDNamingSequence, 'BDA', 'ProtNs'],
  },
  DO: {
    identity: namingIdentity,
    selector: namingSelector,
    parents: ['LNodeType'],
    children: [...tUnNamingSequence],
  },
  DOI: {
    identity: namingIdentity,
    selector: namingSelector,
    parents: [...tAnyLN],
    children: [...tUnNamingSequence, 'SDI', 'DAI'],
  },
  DOType: {
    identity: idNamingIdentity,
    selector: idNamingSelector,
    parents: ['DataTypeTemplates'],
    children: [...tIDNamingSequence, 'SDO', 'DA'],
  },
  DataObjectDirectory: {
    identity: singletonIdentity,
    selector: singletonSelector,
    parents: ['Services'],
    children: [],
  },
  DataSet: {
    identity: namingIdentity,
    selector: namingSelector,
    parents: [...tAnyLN],
    children: [...tNamingSequence, 'FCDA'],
  },
  DataSetDirectory: {
    identity: singletonIdentity,
    selector: singletonSelector,
    parents: ['Services'],
    children: [],
  },
  DataTypeTemplates: {
    identity: singletonIdentity,
    selector: singletonSelector,
    parents: ['SCL'],
    children: ['LNodeType', 'DOType', 'DAType', 'EnumType'],
  },
  DynAssociation: {
    identity: singletonIdentity,
    selector: singletonSelector,
    parents: ['Services'],
    children: [],
  },
  DynDataSet: {
    identity: singletonIdentity,
    selector: singletonSelector,
    parents: ['Services'],
    children: [],
  },
  EnumType: {
    identity: idNamingIdentity,
    selector: idNamingSelector,
    parents: ['DataTypeTemplates'],
    children: [...tIDNamingSequence, 'EnumVal'],
  },
  EnumVal: {
    identity: enumValIdentity,
    selector: enumValSelector,
    parents: ['EnumType'],
    children: [],
  },
  EqFunction: {
    identity: namingIdentity,
    selector: namingSelector,
    parents: [
      'GeneralEquipment',
      'TapChanger',
      'TransformerWinding',
      'PowerTransformer',
      'SubEquipment',
      'ConductingEquipment',
    ],
    children: [...tAbstractEqFuncSubFuncSequence],
  },
  EqSubFunction: {
    identity: namingIdentity,
    selector: namingSelector,
    parents: ['EqSubFunction', 'EqFunction'],
    children: [...tAbstractEqFuncSubFuncSequence],
  },
  ExtRef: {
    identity: extRefIdentity,
    selector: extRefSelector,
    parents: ['Inputs'],
    children: [],
  },
  FCDA: {
    identity: fCDAIdentity,
    selector: fCDASelector,
    parents: ['DataSet'],
    children: [],
  },
  FileHandling: {
    identity: singletonIdentity,
    selector: singletonSelector,
    parents: ['Services'],
    children: [],
  },
  Function: {
    identity: namingIdentity,
    selector: namingSelector,
    parents: ['Bay', 'VoltageLevel', 'Substation', 'Process', 'Line'],
    children: [
      ...tPowerSystemResourceSequence,
      'SubFunction',
      'GeneralEquipment',
      'ConductingEquipment',
    ],
  },
  GeneralEquipment: {
    identity: namingIdentity,
    selector: namingSelector,
    parents: [
      'SubFunction',
      'Function',
      ...tGeneralEquipmentContainer,
      ...tAbstractEqFuncSubFunc,
      ...tEquipmentContainer,
    ],
    children: [...tEquipmentSequence, 'EqFunction'],
  },
  GetCBValues: {
    identity: singletonIdentity,
    selector: singletonSelector,
    parents: ['Services'],
    children: [],
  },
  GetDataObjectDefinition: {
    identity: singletonIdentity,
    selector: singletonSelector,
    parents: ['Services'],
    children: [],
  },
  GetDataSetValue: {
    identity: singletonIdentity,
    selector: singletonSelector,
    parents: ['Services'],
    children: [],
  },
  GetDirectory: {
    identity: singletonIdentity,
    selector: singletonSelector,
    parents: ['Services'],
    children: [],
  },
  GOOSE: {
    identity: singletonIdentity,
    selector: singletonSelector,
    parents: ['Services'],
    children: [],
  },
  GOOSESecurity: {
    identity: namingIdentity,
    selector: namingSelector,
    parents: ['AccessPoint'],
    children: [...tNamingSequence, 'Subject', 'IssuerName'],
  },
  GSE: {
    identity: controlBlockIdentity,
    selector: controlBlockSelector,
    parents: ['ConnectedAP'],
    children: [...tControlBlockSequence, 'MinTime', 'MaxTime'],
  },
  GSEDir: {
    identity: singletonIdentity,
    selector: singletonSelector,
    parents: ['Services'],
    children: [],
  },
  GSEControl: {
    identity: namingIdentity,
    selector: namingSelector,
    parents: ['LN0'],
    children: [...tControlWithIEDNameSequence, 'Protocol'],
  },
  GSESettings: {
    identity: singletonIdentity,
    selector: singletonSelector,
    parents: ['Services'],
    children: [],
  },
  GSSE: {
    identity: singletonIdentity,
    selector: singletonSelector,
    parents: ['Services'],
    children: [],
  },
  Header: {
    identity: singletonIdentity,
    selector: singletonSelector,
    parents: ['SCL'],
    children: ['Text', 'History'],
  },
  History: {
    identity: singletonIdentity,
    selector: singletonSelector,
    parents: ['Header'],
    children: ['Hitem'],
  },
  Hitem: {
    identity: hitemIdentity,
    selector: hitemSelector,
    parents: ['History'],
    children: [],
  },
  IED: {
    identity: namingIdentity,
    selector: namingSelector,
    parents: ['SCL'],
    children: [...tUnNamingSequence, 'Services', 'AccessPoint', 'KDC'],
  },
  IEDName: {
    identity: iEDNameIdentity,
    selector: iEDNameSelector,
    parents: ['GSEControl', 'SampledValueControl'],
    children: [],
  },
  Inputs: {
    identity: singletonIdentity,
    selector: singletonSelector,
    parents: [...tAnyLN],
    children: [...tUnNamingSequence, 'ExtRef'],
  },
  IssuerName: {
    identity: singletonIdentity,
    selector: singletonSelector,
    parents: ['GOOSESecurity', 'SMVSecurity'],
    children: [],
  },
  KDC: {
    identity: kDCIdentity,
    selector: kDCSelector,
    parents: ['IED'],
    children: [],
  },
  LDevice: {
    identity: lDeviceIdentity,
    selector: lDeviceSelector,
    parents: ['Server'],
    children: [...tUnNamingSequence, 'LN0', 'LN', 'AccessControl'],
  },
  LN: {
    identity: lNIdentity,
    selector: lNSelector,
    parents: ['AccessPoint', 'LDevice'],
    children: [...tAnyLNSequence],
  },
  LN0: {
    identity: singletonIdentity,
    selector: singletonSelector,
    parents: ['LDevice'],
    children: [
      ...tAnyLNSequence,
      'GSEControl',
      'SampledValueControl',
      'SettingControl',
    ],
  },
  LNode: {
    identity: lNodeIdentity,
    selector: lNodeSelector,
    parents: [...tLNodeContainer],
    children: [...tUnNamingSequence],
  },
  LNodeType: {
    identity: idNamingIdentity,
    selector: idNamingSelector,
    parents: ['DataTypeTemplates'],
    children: [...tIDNamingSequence, 'DO'],
  },
  Line: {
    identity: namingIdentity,
    selector: namingSelector,
    parents: ['Process', 'SCL'],
    children: [
      ...tGeneralEquipmentContainerSequence,
      'Voltage',
      'ConductingEquipment',
    ],
  },
  Log: {
    identity: namingIdentity,
    selector: namingSelector,
    parents: [...tAnyLN],
    children: [...tUnNamingSequence],
  },
  LogControl: {
    identity: namingIdentity,
    selector: namingSelector,
    parents: [...tAnyLN],
    children: [...tControlWithTriggerOptSequence],
  },
  LogSettings: {
    identity: singletonIdentity,
    selector: singletonSelector,
    parents: ['Services'],
    children: [],
  },
  MaxTime: {
    identity: singletonIdentity,
    selector: singletonSelector,
    parents: ['GSE'],
    children: [],
  },
  McSecurity: {
    identity: singletonIdentity,
    selector: singletonSelector,
    parents: ['GSESettings', 'SMVSettings', 'ClientServices'],
    children: [],
  },
  MinTime: {
    identity: singletonIdentity,
    selector: singletonSelector,
    parents: ['GSE'],
    children: [],
  },
  NeutralPoint: {
    identity: terminalIdentity,
    selector: terminalSelector,
    parents: ['TransformerWinding'],
    children: [...tUnNamingSequence],
  },
  OptFields: {
    identity: singletonIdentity,
    selector: singletonSelector,
    parents: ['ReportControl'],
    children: [],
  },
  P: {
    identity: pIdentity,
    selector: pSelector,
    parents: ['Address', 'PhysConn'],
    children: [],
  },
  PhysConn: {
    identity: physConnIdentity,
    selector: physConnSelector,
    parents: ['ConnectedAP'],
    children: [...tUnNamingSequence, 'P'],
  },
  PowerTransformer: {
    identity: namingIdentity,
    selector: namingSelector,
    parents: [...tEquipmentContainer],
    children: [
      ...tEquipmentSequence,
      'TransformerWinding',
      'SubEquipment',
      'EqFunction',
    ],
  },
  Private: {
    identity: () => NaN,
    selector: () => voidSelector,
    parents: [],
    children: [],
  },
  Process: {
    identity: namingIdentity,
    selector: namingSelector,
    parents: ['Process', 'SCL'],
    children: [
      ...tGeneralEquipmentContainerSequence,
      'ConductingEquipment',
      'Substation',
      'Line',
      'Process',
    ],
  },
  ProtNs: {
    identity: protNsIdentity,
    selector: protNsSelector,
    parents: ['DAType', 'DA'],
    children: [],
  },
  Protocol: {
    identity: singletonIdentity,
    selector: singletonSelector,
    parents: ['GSEControl', 'SampledValueControl'],
    children: [],
  },
  ReadWrite: {
    identity: singletonIdentity,
    selector: singletonSelector,
    parents: ['Services'],
    children: [],
  },
  RedProt: {
    identity: singletonIdentity,
    selector: singletonSelector,
    parents: ['Services'],
    children: [],
  },
  ReportControl: {
    identity: namingIdentity,
    selector: namingSelector,
    parents: [...tAnyLN],
    children: [...tControlWithTriggerOptSequence, 'OptFields', 'RptEnabled'],
  },
  ReportSettings: {
    identity: singletonIdentity,
    selector: singletonSelector,
    parents: ['Services'],
    children: [],
  },
  RptEnabled: {
    identity: singletonIdentity,
    selector: singletonSelector,
    parents: ['ReportControl'],
    children: [...tUnNamingSequence, 'ClientLN'],
  },
  SamplesPerSec: {
    identity: singletonIdentity,
    selector: singletonSelector,
    parents: ['SMVSettings'],
    children: [],
  },
  SampledValueControl: {
    identity: namingIdentity,
    selector: namingSelector,
    parents: ['LN0'],
    children: [...tControlWithIEDNameSequence, 'SmvOpts'],
  },
  SecPerSamples: {
    identity: singletonIdentity,
    selector: singletonSelector,
    parents: ['SMVSettings'],
    children: [],
  },
  SCL: {
    identity: sCLIdentity,
    selector: sCLSelector,
    parents: [],
    children: [
      ...tBaseNameSequence,
      'Header',
      'Substation',
      'Communication',
      'IED',
      'DataTypeTemplates',
      'Line',
      'Process',
    ],
  },
  SDI: {
    identity: ixNamingIdentity,
    selector: ixNamingSelector,
    parents: ['DOI', 'SDI'],
    children: [...tUnNamingSequence, 'SDI', 'DAI'],
  },
  SDO: {
    identity: namingIdentity,
    selector: namingSelector,
    parents: ['DOType'],
    children: [...tNamingSequence],
  },
  Server: {
    identity: singletonIdentity,
    selector: singletonSelector,
    parents: ['AccessPoint'],
    children: [
      ...tUnNamingSequence,
      'Authentication',
      'LDevice',
      'Association',
    ],
  },
  ServerAt: {
    identity: singletonIdentity,
    selector: singletonSelector,
    parents: ['AccessPoint'],
    children: [...tUnNamingSequence],
  },
  Services: {
    identity: singletonIdentity,
    selector: singletonSelector,
    parents: ['IED', 'AccessPoint'],
    children: [
      'DynAssociation',
      'SettingGroups',
      'GetDirectory',
      'GetDataObjectDefinition',
      'DataObjectDirectory',
      'GetDataSetValue',
      'SetDataSetValue',
      'DataSetDirectory',
      'ConfDataSet',
      'DynDataSet',
      'ReadWrite',
      'TimerActivatedControl',
      'ConfReportControl',
      'GetCBValues',
      'ConfLogControl',
      'ReportSettings',
      'LogSettings',
      'GSESettings',
      'SMVSettings',
      'GSEDir',
      'GOOSE',
      'GSSE',
      'SMVsc',
      'FileHandling',
      'ConfLNs',
      'ClientServices',
      'ConfLdName',
      'SupSubscription',
      'ConfSigRef',
      'ValueHandling',
      'RedProt',
      'TimeSyncProt',
      'CommProt',
    ],
  },
  SetDataSetValue: {
    identity: singletonIdentity,
    selector: singletonSelector,
    parents: ['Services'],
    children: [],
  },
  SettingControl: {
    identity: singletonIdentity,
    selector: singletonSelector,
    parents: ['LN0'],
    children: [...tUnNamingSequence],
  },
  SettingGroups: {
    identity: singletonIdentity,
    selector: singletonSelector,
    parents: ['Services'],
    children: ['SGEdit', 'ConfSG'],
  },
  SGEdit: {
    identity: singletonIdentity,
    selector: singletonSelector,
    parents: ['SettingGroups'],
    children: [],
  },
  SmpRate: {
    identity: singletonIdentity,
    selector: singletonSelector,
    parents: ['SMVSettings'],
    children: [],
  },
  SMV: {
    identity: controlBlockIdentity,
    selector: controlBlockSelector,
    parents: ['ConnectedAP'],
    children: [...tControlBlockSequence],
  },
  SmvOpts: {
    identity: singletonIdentity,
    selector: singletonSelector,
    parents: ['SampledValueControl'],
    children: [],
  },
  SMVsc: {
    identity: singletonIdentity,
    selector: singletonSelector,
    parents: ['Services'],
    children: [],
  },
  SMVSecurity: {
    identity: namingIdentity,
    selector: namingSelector,
    parents: ['AccessPoint'],
    children: [...tNamingSequence, 'Subject', 'IssuerName'],
  },
  SMVSettings: {
    identity: singletonIdentity,
    selector: singletonSelector,
    parents: ['Services'],
    children: ['SmpRate', 'SamplesPerSec', 'SecPerSamples', 'McSecurity'],
  },
  SubEquipment: {
    identity: namingIdentity,
    selector: namingSelector,
    parents: [
      'TapChanger',
      'PowerTransformer',
      ...tAbstractConductingEquipment,
    ],
    children: [...tPowerSystemResourceSequence, 'EqFunction'],
  },
  SubFunction: {
    identity: namingIdentity,
    selector: namingSelector,
    parents: ['SubFunction', 'Function'],
    children: [
      ...tPowerSystemResourceSequence,
      'GeneralEquipment',
      'ConductingEquipment',
      'SubFunction',
    ],
  },
  SubNetwork: {
    identity: namingIdentity,
    selector: namingSelector,
    parents: ['Communication'],
    children: [...tNamingSequence, 'BitRate', 'ConnectedAP'],
  },
  Subject: {
    identity: singletonIdentity,
    selector: singletonSelector,
    parents: ['GOOSESecurity', 'SMVSecurity'],
    children: [],
  },
  Substation: {
    identity: namingIdentity,
    selector: namingSelector,
    parents: ['SCL'],
    children: [...tEquipmentContainerSequence, 'VoltageLevel', 'Function'],
  },
  SupSubscription: {
    identity: singletonIdentity,
    selector: singletonSelector,
    parents: ['Services'],
    children: [],
  },
  TapChanger: {
    identity: namingIdentity,
    selector: namingSelector,
    parents: ['TransformerWinding'],
    children: [...tPowerSystemResourceSequence, 'SubEquipment', 'EqFunction'],
  },
  Terminal: {
    identity: terminalIdentity,
    selector: terminalSelector,
    parents: [...tEquipment],
    children: [...tUnNamingSequence],
  },
  Text: {
    identity: singletonIdentity,
    selector: singletonSelector,
    parents: sCLTags.filter(tag => tag !== 'Text' && tag !== 'Private'),
    children: [],
  },
  TimerActivatedControl: {
    identity: singletonIdentity,
    selector: singletonSelector,
    parents: ['Services'],
    children: [],
  },
  TimeSyncProt: {
    identity: singletonIdentity,
    selector: singletonSelector,
    parents: ['Services', 'ClientServices'],
    children: [],
  },
  TransformerWinding: {
    identity: namingIdentity,
    selector: namingSelector,
    parents: ['PowerTransformer'],
    children: [
      ...tAbstractConductingEquipmentSequence,
      'TapChanger',
      'NeutralPoint',
      'EqFunction',
    ],
  },
  TrgOps: {
    identity: singletonIdentity,
    selector: singletonSelector,
    parents: ['ReportControl'],
    children: [],
  },
  Val: {
    identity: valIdentity,
    selector: valSelector,
    parents: ['DAI', 'DA', 'BDA'],
    children: [],
  },
  ValueHandling: {
    identity: singletonIdentity,
    selector: singletonSelector,
    parents: ['Services'],
    children: [],
  },
  Voltage: {
    identity: singletonIdentity,
    selector: singletonSelector,
    parents: ['VoltageLevel'],
    children: [],
  },
  VoltageLevel: {
    identity: namingIdentity,
    selector: namingSelector,
    parents: ['Substation'],
    children: [...tEquipmentContainerSequence, 'Voltage', 'Bay', 'Function'],
  },
};

export function getReference(parent: Element, tag: SCLTag): Element | null {
  const parentTag = parent.tagName;
  const children = Array.from(parent.children);

  if (
    parentTag === 'Services' ||
    parentTag === 'SettingGroups' ||
    !isSCLTag(parentTag)
  )
    return children.find(child => child.tagName === tag) ?? null;

  const sequence = tags[parentTag]?.children ?? [];
  let index = sequence.findIndex(element => element === tag);

  if (index < 0) return null;

  let nextSibling: Element | undefined;
  while (index < sequence.length && !nextSibling) {
    nextSibling = children.find(child => child.tagName === sequence[index]);
    index++;
  }

  return nextSibling ?? null;
}

export function selector(tagName: string, identity: string | number): string {
  if (typeof identity !== 'string') return voidSelector;

  if (isSCLTag(tagName)) return tags[tagName].selector(tagName, identity);

  return tagName;
}

/** @returns a string uniquely identifying `e` in its document, or NaN if `e`
 * is unidentifiable. */
export function identity(e: Element | null): string | number {
  if (e === null) return NaN;
  if (e.closest('Private')) return NaN;
  const tag = e.tagName;

  if (isSCLTag(tag)) return tags[tag].identity(e);

  return NaN;
}

/** @returns whether `a` and `b` are considered identical by IEC-61850 */
export function isSame(a: Element, b: Element): boolean {
  if (a.tagName === 'Private')
    return isSame(a.parentElement!, b.parentElement!) && a.isEqualNode(b);
  return a.tagName === b.tagName && identity(a) === identity(b);
}

export function isEqual(a: Element, b: Element): boolean {
  if (a.closest('Private') || b.closest('Private')) return a.isEqualNode(b);

  const attributeNames = new Set(
    a.getAttributeNames().concat(b.getAttributeNames())
  );
  for (const name of attributeNames)
    if (a.getAttribute(name) !== b.getAttribute(name)) return false;

  if (a.childElementCount === 0)
    return (
      b.childElementCount === 0 &&
      a.textContent?.trim() === b.textContent?.trim()
    );

  const aChildren = Array.from(a.children);
  const bChildren = Array.from(b.children);

  for (const aChild of aChildren) {
    const twindex = bChildren.findIndex(bChild => isEqual(aChild, bChild));
    if (twindex === -1) return false;
    bChildren.splice(twindex, 1);
  }

  for (const bChild of bChildren)
    if (!aChildren.find(aChild => isEqual(bChild, aChild))) return false;

  return true;
}

/** @returns a new [[`tag`]] element owned by [[`doc`]]. */
export function createElement(
  doc: Document,
  tag: string,
  attrs: Record<string, string | null>
): Element {
  const element = doc.createElementNS(doc.documentElement.namespaceURI, tag);
  Object.entries(attrs)
    .filter(([_, value]) => value !== null)
    .forEach(([name, value]) => element.setAttribute(name, value!));
  return element;
}

/** @returns a clone of `element` with attributes set to values from `attrs`. */
export function cloneElement(
  element: Element,
  attrs: Record<string, string | null>
): Element {
  const newElement = <Element>element.cloneNode(false);
  Object.entries(attrs).forEach(([name, value]) => {
    if (value === null) newElement.removeAttribute(name);
    else newElement.setAttribute(name, value);
  });
  return newElement;
}

/** A directive rendering its argument `rendered` only if `rendered !== {}`. */
export const ifImplemented = directive(rendered => (part: Part) => {
  if (Object.keys(rendered).length) part.setValue(rendered);
  else part.setValue('');
});

/** Constructor type for defining `LitElement` mixins. */
export type LitElementConstructor = new (...args: any[]) => LitElement;

/** The type returned by `MyMixin(...)` is `Mixin<typeof MyMixin>`. */
export type Mixin<T extends (...args: any[]) => any> = InstanceType<
  ReturnType<T>
>;

const nameStartChar =
  '[:_A-Za-z]|[\u00C0-\u00D6]|[\u00D8-\u00F6]|[\u00F8-\u02FF]|[\u0370-\u037D]' +
  '|[\u037F-\u1FFF]|[\u200C-\u200D]|[\u2070-\u218F]|[\u2C00-\u2FEF]' +
  '|[\u3001-\uD7FF]|[\uF900-\uFDCF]|[\uFDF0-\uFFFD]|[\u{10000}\\-\u{EFFFF}]';
const nameChar =
  nameStartChar + '|[.0-9-]|\u00B7|[\u0300-\u036F]|[\u203F-\u2040]';
const name = nameStartChar + '(' + nameChar + ')*';
const nmToken = '(' + nameChar + ')+';

export const patterns = {
  string:
    '([\u0009-\u000A]|[\u000D]|[\u0020-\u007E]|[\u0085]|[\u00A0-\uD7FF]' +
    '|[\uE000-\uFFFD]|[\u{10000}\\-\u{10FFFF}])*',
  normalizedString:
    '([\u0020-\u007E]|[\u0085]|[\u00A0-\uD7FF]|[\uE000-\uFFFD]' +
    '|[\u{10000}\\-\u{10FFFF}])*',
  name,
  nmToken,
  names: name + '( ' + name + ')*',
  nmTokens: nmToken + '( ' + nmToken + ')*',
  decimal: '((-|\\+)?([0-9]+(\\.[0-9]*)?|\\.[0-9]+))',
  unsigned: '\\+?([0-9]+(\\.[0-9]*)?|\\.[0-9]+)',
  alphanumericFirstUpperCase: '[A-Z][0-9,A-Z,a-z]*',
  alphanumericFirstLowerCase: '[a-z][0-9,A-Z,a-z]*',
  lnClass: '[A-Z]{4,4}',
};

/** Sorts selected `ListItem`s to the top and disabled ones to the bottom. */
export function compareNames(a: Element | string, b: Element | string): number {
  if (typeof a === 'string' && typeof b === 'string') return a.localeCompare(b);

  if (typeof a === 'object' && typeof b === 'string')
    return a.getAttribute('name')!.localeCompare(b);

  if (typeof a === 'string' && typeof b === 'object')
    return a.localeCompare(b.getAttribute('name')!);

  if (typeof a === 'object' && typeof b === 'object')
    return a.getAttribute('name')!.localeCompare(b.getAttribute('name')!);

  return 0;
}

/** Throws an error bearing `message`, never returning. */
export function unreachable(message: string): never {
  throw new Error(message);
}

/** @returns the cartesian product of `arrays` */
export function crossProduct<T>(...arrays: T[][]): T[][] {
  return arrays.reduce<T[][]>(
    (a, b) => <T[][]>a.flatMap(d => b.map(e => [d, e].flat())),
    [[]]
  );
}

export function findFCDAs(extRef: Element): Element[] {
  if (extRef.tagName !== 'ExtRef' || extRef.closest('Private')) return [];

  const [iedName, ldInst, prefix, lnClass, lnInst, doName, daName] = [
    'iedName',
    'ldInst',
    'prefix',
    'lnClass',
    'lnInst',
    'doName',
    'daName',
  ].map(name => extRef.getAttribute(name));
  const ied = Array.from(extRef.ownerDocument.getElementsByTagName('IED')).find(
    element =>
      element.getAttribute('name') === iedName && !element.closest('Private')
  );
  if (!ied) return [];

  return Array.from(ied.getElementsByTagName('FCDA'))
    .filter(item => !item.closest('Private'))
    .filter(
      fcda =>
        (fcda.getAttribute('ldInst') ?? '') === (ldInst ?? '') &&
        (fcda.getAttribute('prefix') ?? '') === (prefix ?? '') &&
        (fcda.getAttribute('lnClass') ?? '') === (lnClass ?? '') &&
        (fcda.getAttribute('lnInst') ?? '') === (lnInst ?? '') &&
        (fcda.getAttribute('doName') ?? '') === (doName ?? '') &&
        (fcda.getAttribute('daName') ?? '') === (daName ?? '')
    );
}

const serviceTypeControlBlockTags: Partial<Record<string, string[]>> = {
  GOOSE: ['GSEControl'],
  SMV: ['SampledValueControl'],
  Report: ['ReportControl'],
  NONE: ['LogControl', 'GSEControl', 'SampledValueControl', 'ReportControl'],
};

export function findControlBlocks(extRef: Element): Set<Element> {
  const fcdas = findFCDAs(extRef);
  const cbTags =
    serviceTypeControlBlockTags[extRef.getAttribute('serviceType') ?? 'NONE'] ??
    [];
  const controlBlocks = new Set(
    fcdas.flatMap(fcda => {
      const dataSet = fcda.parentElement!;
      const dsName = dataSet.getAttribute('name') ?? '';
      const anyLN = dataSet.parentElement!;
      return cbTags
        .flatMap(tag => Array.from(anyLN.getElementsByTagName(tag)))
        .filter(cb => cb.getAttribute('datSet') === dsName);
    })
  );
  return controlBlocks;
}

export function isPublic(element: Element): boolean {
  return !element.closest('Private');
}

/** @returns the version of the SCL project */
export function getVersion(element: Element): string {
  const header = Array.from(
    element.ownerDocument.getElementsByTagName('Header')
  ).filter(item => !item.closest('Private'));

  return header[0].getAttribute('version') ?? '2003';
}

export function getChildElementsByTagName(
  element: Element,
  tag: string
): Element[] {
  return Array.from(element.children).filter(
    element => element.tagName === tag
  );
}

declare global {
  interface ElementEventMap {
    ['pending-state']: PendingStateEvent;
    ['editor-action']: EditorActionEvent<EditorAction>;
    ['open-doc']: OpenDocEvent;
    ['wizard']: WizardEvent;
    ['validate']: ValidateEvent;
    ['log']: LogEvent;
    ['issue']: IssueEvent;
  }
}
