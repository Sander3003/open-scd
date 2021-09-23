import { SCLTag, Wizard } from '../foundation.js';

import { createBayWizard, editBayWizard } from './bay.js';
import {
  createConductingEquipmentWizard,
  editConductingEquipmentWizard,
} from './conductingequipment.js';
import { lNodeWizard } from './lnode.js';
import { createSubstationWizard, substationEditWizard } from './substation.js';
import {
  voltageLevelCreateWizard,
  voltageLevelEditWizard,
} from './voltagelevel.js';
import {
  createXxxFunctionWizard,
  editXxxFunctionWizard,
  selectEqFunctionWizard,
  selectEqSubFunctionWizard,
  selectFunctionWizard,
  selectSubFunctionWizard,
} from './xxxfunction.js';

type SclElementWizard = (element: Element) => Wizard | undefined;

export function emptyWizard(): Wizard | undefined {
  return;
}

export const wizards: Record<
  SCLTag,
  {
    edit: SclElementWizard;
    create: SclElementWizard;
    select: SclElementWizard;
  }
> = {
  AccessControl: {
    edit: emptyWizard,
    create: emptyWizard,
    select: emptyWizard,
  },
  AccessPoint: {
    edit: emptyWizard,
    create: emptyWizard,
    select: emptyWizard,
  },
  Address: {
    edit: emptyWizard,
    create: emptyWizard,
    select: emptyWizard,
  },
  Association: {
    edit: emptyWizard,
    create: emptyWizard,
    select: emptyWizard,
  },
  Authentication: {
    edit: emptyWizard,
    create: emptyWizard,
    select: emptyWizard,
  },
  BDA: {
    edit: emptyWizard,
    create: emptyWizard,
    select: emptyWizard,
  },
  BitRate: {
    edit: emptyWizard,
    create: emptyWizard,
    select: emptyWizard,
  },
  Bay: {
    edit: editBayWizard,
    create: createBayWizard,
    select: emptyWizard,
  },
  ClientLN: {
    edit: emptyWizard,
    create: emptyWizard,
    select: emptyWizard,
  },
  ClientServices: {
    edit: emptyWizard,
    create: emptyWizard,
    select: emptyWizard,
  },
  CommProt: {
    edit: emptyWizard,
    create: emptyWizard,
    select: emptyWizard,
  },
  Communication: {
    edit: emptyWizard,
    create: emptyWizard,
    select: emptyWizard,
  },
  ConductingEquipment: {
    edit: editConductingEquipmentWizard,
    create: createConductingEquipmentWizard,
    select: emptyWizard,
  },
  ConfDataSet: {
    edit: emptyWizard,
    create: emptyWizard,
    select: emptyWizard,
  },
  ConfLdName: {
    edit: emptyWizard,
    create: emptyWizard,
    select: emptyWizard,
  },
  ConfLNs: {
    edit: emptyWizard,
    create: emptyWizard,
    select: emptyWizard,
  },
  ConfLogControl: {
    edit: emptyWizard,
    create: emptyWizard,
    select: emptyWizard,
  },
  ConfReportControl: {
    edit: emptyWizard,
    create: emptyWizard,
    select: emptyWizard,
  },
  ConfSG: {
    edit: emptyWizard,
    create: emptyWizard,
    select: emptyWizard,
  },
  ConfSigRef: {
    edit: emptyWizard,
    create: emptyWizard,
    select: emptyWizard,
  },
  ConnectedAP: {
    edit: emptyWizard,
    create: emptyWizard,
    select: emptyWizard,
  },
  ConnectivityNode: {
    edit: emptyWizard,
    create: emptyWizard,
    select: emptyWizard,
  },
  DA: {
    edit: emptyWizard,
    create: emptyWizard,
    select: emptyWizard,
  },
  DAI: {
    edit: emptyWizard,
    create: emptyWizard,
    select: emptyWizard,
  },
  DAType: {
    edit: emptyWizard,
    create: emptyWizard,
    select: emptyWizard,
  },
  DO: {
    edit: emptyWizard,
    create: emptyWizard,
    select: emptyWizard,
  },
  DOI: {
    edit: emptyWizard,
    create: emptyWizard,
    select: emptyWizard,
  },
  DOType: {
    edit: emptyWizard,
    create: emptyWizard,
    select: emptyWizard,
  },
  DataObjectDirectory: {
    edit: emptyWizard,
    create: emptyWizard,
    select: emptyWizard,
  },
  DataSet: {
    edit: emptyWizard,
    create: emptyWizard,
    select: emptyWizard,
  },
  DataSetDirectory: {
    edit: emptyWizard,
    create: emptyWizard,
    select: emptyWizard,
  },
  DataTypeTemplates: {
    edit: emptyWizard,
    create: emptyWizard,
    select: emptyWizard,
  },
  DynAssociation: {
    edit: emptyWizard,
    create: emptyWizard,
    select: emptyWizard,
  },
  DynDataSet: {
    edit: emptyWizard,
    create: emptyWizard,
    select: emptyWizard,
  },
  EnumType: {
    edit: emptyWizard,
    create: emptyWizard,
    select: emptyWizard,
  },
  EnumVal: {
    edit: emptyWizard,
    create: emptyWizard,
    select: emptyWizard,
  },
  EqFunction: {
    edit: editXxxFunctionWizard,
    create: createXxxFunctionWizard,
    select: selectEqFunctionWizard,
  },
  EqSubFunction: {
    edit: editXxxFunctionWizard,
    create: createXxxFunctionWizard,
    select: selectEqSubFunctionWizard,
  },
  ExtRef: {
    edit: emptyWizard,
    create: emptyWizard,
    select: emptyWizard,
  },
  FCDA: {
    edit: emptyWizard,
    create: emptyWizard,
    select: emptyWizard,
  },
  FileHandling: {
    edit: emptyWizard,
    create: emptyWizard,
    select: emptyWizard,
  },
  Function: {
    edit: editXxxFunctionWizard,
    create: createXxxFunctionWizard,
    select: selectFunctionWizard,
  },
  GeneralEquipment: {
    edit: emptyWizard,
    create: emptyWizard,
    select: emptyWizard,
  },
  GetCBValues: {
    edit: emptyWizard,
    create: emptyWizard,
    select: emptyWizard,
  },
  GetDataObjectDefinition: {
    edit: emptyWizard,
    create: emptyWizard,
    select: emptyWizard,
  },
  GetDataSetValue: {
    edit: emptyWizard,
    create: emptyWizard,
    select: emptyWizard,
  },
  GetDirectory: {
    edit: emptyWizard,
    create: emptyWizard,
    select: emptyWizard,
  },
  GOOSE: {
    edit: emptyWizard,
    create: emptyWizard,
    select: emptyWizard,
  },
  GOOSESecurity: {
    edit: emptyWizard,
    create: emptyWizard,
    select: emptyWizard,
  },
  GSE: {
    edit: emptyWizard,
    create: emptyWizard,
    select: emptyWizard,
  },
  GSEDir: {
    edit: emptyWizard,
    create: emptyWizard,
    select: emptyWizard,
  },
  GSEControl: {
    edit: emptyWizard,
    create: emptyWizard,
    select: emptyWizard,
  },
  GSESettings: {
    edit: emptyWizard,
    create: emptyWizard,
    select: emptyWizard,
  },
  GSSE: {
    edit: emptyWizard,
    create: emptyWizard,
    select: emptyWizard,
  },
  Header: {
    edit: emptyWizard,
    create: emptyWizard,
    select: emptyWizard,
  },
  History: {
    edit: emptyWizard,
    create: emptyWizard,
    select: emptyWizard,
  },
  Hitem: {
    edit: emptyWizard,
    create: emptyWizard,
    select: emptyWizard,
  },
  IED: {
    edit: emptyWizard,
    create: emptyWizard,
    select: emptyWizard,
  },
  IEDName: {
    edit: emptyWizard,
    create: emptyWizard,
    select: emptyWizard,
  },
  Inputs: {
    edit: emptyWizard,
    create: emptyWizard,
    select: emptyWizard,
  },
  IssuerName: {
    edit: emptyWizard,
    create: emptyWizard,
    select: emptyWizard,
  },
  KDC: {
    edit: emptyWizard,
    create: emptyWizard,
    select: emptyWizard,
  },
  LDevice: {
    edit: emptyWizard,
    create: emptyWizard,
    select: emptyWizard,
  },
  LN: {
    edit: emptyWizard,
    create: emptyWizard,
    select: emptyWizard,
  },
  LN0: {
    edit: emptyWizard,
    create: emptyWizard,
    select: emptyWizard,
  },
  LNode: {
    edit: lNodeWizard,
    create: lNodeWizard,
    select: emptyWizard,
  },
  LNodeType: {
    edit: emptyWizard,
    create: emptyWizard,
    select: emptyWizard,
  },
  Line: {
    edit: emptyWizard,
    create: emptyWizard,
    select: emptyWizard,
  },
  Log: {
    edit: emptyWizard,
    create: emptyWizard,
    select: emptyWizard,
  },
  LogControl: {
    edit: emptyWizard,
    create: emptyWizard,
    select: emptyWizard,
  },
  LogSettings: {
    edit: emptyWizard,
    create: emptyWizard,
    select: emptyWizard,
  },
  MaxTime: {
    edit: emptyWizard,
    create: emptyWizard,
    select: emptyWizard,
  },
  McSecurity: {
    edit: emptyWizard,
    create: emptyWizard,
    select: emptyWizard,
  },
  MinTime: {
    edit: emptyWizard,
    create: emptyWizard,
    select: emptyWizard,
  },
  NeutralPoint: {
    edit: emptyWizard,
    create: emptyWizard,
    select: emptyWizard,
  },
  OptFields: {
    edit: emptyWizard,
    create: emptyWizard,
    select: emptyWizard,
  },
  P: {
    edit: emptyWizard,
    create: emptyWizard,
    select: emptyWizard,
  },
  PhysConn: {
    edit: emptyWizard,
    create: emptyWizard,
    select: emptyWizard,
  },
  PowerTransformer: {
    edit: emptyWizard,
    create: emptyWizard,
    select: emptyWizard,
  },
  Private: {
    edit: emptyWizard,
    create: emptyWizard,
    select: emptyWizard,
  },
  Process: {
    edit: emptyWizard,
    create: emptyWizard,
    select: emptyWizard,
  },
  ProtNs: {
    edit: emptyWizard,
    create: emptyWizard,
    select: emptyWizard,
  },
  Protocol: {
    edit: emptyWizard,
    create: emptyWizard,
    select: emptyWizard,
  },
  ReadWrite: {
    edit: emptyWizard,
    create: emptyWizard,
    select: emptyWizard,
  },
  RedProt: {
    edit: emptyWizard,
    create: emptyWizard,
    select: emptyWizard,
  },
  ReportControl: {
    edit: emptyWizard,
    create: emptyWizard,
    select: emptyWizard,
  },
  ReportSettings: {
    edit: emptyWizard,
    create: emptyWizard,
    select: emptyWizard,
  },
  RptEnabled: {
    edit: emptyWizard,
    create: emptyWizard,
    select: emptyWizard,
  },
  SamplesPerSec: {
    edit: emptyWizard,
    create: emptyWizard,
    select: emptyWizard,
  },
  SampledValueControl: {
    edit: emptyWizard,
    create: emptyWizard,
    select: emptyWizard,
  },
  SecPerSamples: {
    edit: emptyWizard,
    create: emptyWizard,
    select: emptyWizard,
  },
  SCL: {
    edit: emptyWizard,
    create: emptyWizard,
    select: emptyWizard,
  },
  SDI: {
    edit: emptyWizard,
    create: emptyWizard,
    select: emptyWizard,
  },
  SDO: {
    edit: emptyWizard,
    create: emptyWizard,
    select: emptyWizard,
  },
  Server: {
    edit: emptyWizard,
    create: emptyWizard,
    select: emptyWizard,
  },
  ServerAt: {
    edit: emptyWizard,
    create: emptyWizard,
    select: emptyWizard,
  },
  Services: {
    edit: emptyWizard,
    create: emptyWizard,
    select: emptyWizard,
  },
  SetDataSetValue: {
    edit: emptyWizard,
    create: emptyWizard,
    select: emptyWizard,
  },
  SettingControl: {
    edit: emptyWizard,
    create: emptyWizard,
    select: emptyWizard,
  },
  SettingGroups: {
    edit: emptyWizard,
    create: emptyWizard,
    select: emptyWizard,
  },
  SGEdit: {
    edit: emptyWizard,
    create: emptyWizard,
    select: emptyWizard,
  },
  SmpRate: {
    edit: emptyWizard,
    create: emptyWizard,
    select: emptyWizard,
  },
  SMV: {
    edit: emptyWizard,
    create: emptyWizard,
    select: emptyWizard,
  },
  SmvOpts: {
    edit: emptyWizard,
    create: emptyWizard,
    select: emptyWizard,
  },
  SMVsc: {
    edit: emptyWizard,
    create: emptyWizard,
    select: emptyWizard,
  },
  SMVSecurity: {
    edit: emptyWizard,
    create: emptyWizard,
    select: emptyWizard,
  },
  SMVSettings: {
    edit: emptyWizard,
    create: emptyWizard,
    select: emptyWizard,
  },
  SubEquipment: {
    edit: emptyWizard,
    create: emptyWizard,
    select: emptyWizard,
  },
  SubFunction: {
    edit: editXxxFunctionWizard,
    create: createXxxFunctionWizard,
    select: selectSubFunctionWizard,
  },
  SubNetwork: {
    edit: emptyWizard,
    create: emptyWizard,
    select: emptyWizard,
  },
  Subject: {
    edit: emptyWizard,
    create: emptyWizard,
    select: emptyWizard,
  },
  Substation: {
    edit: substationEditWizard,
    create: createSubstationWizard,
    select: emptyWizard,
  },
  SupSubscription: {
    edit: emptyWizard,
    create: emptyWizard,
    select: emptyWizard,
  },
  TapChanger: {
    edit: emptyWizard,
    create: emptyWizard,
    select: emptyWizard,
  },
  Terminal: {
    edit: emptyWizard,
    create: emptyWizard,
    select: emptyWizard,
  },
  Text: {
    edit: emptyWizard,
    create: emptyWizard,
    select: emptyWizard,
  },
  TimerActivatedControl: {
    edit: emptyWizard,
    create: emptyWizard,
    select: emptyWizard,
  },
  TimeSyncProt: {
    edit: emptyWizard,
    create: emptyWizard,
    select: emptyWizard,
  },
  TransformerWinding: {
    edit: emptyWizard,
    create: emptyWizard,
    select: emptyWizard,
  },
  TrgOps: {
    edit: emptyWizard,
    create: emptyWizard,
    select: emptyWizard,
  },
  Val: {
    edit: emptyWizard,
    create: emptyWizard,
    select: emptyWizard,
  },
  ValueHandling: {
    edit: emptyWizard,
    create: emptyWizard,
    select: emptyWizard,
  },
  Voltage: {
    edit: emptyWizard,
    create: emptyWizard,
    select: emptyWizard,
  },
  VoltageLevel: {
    edit: voltageLevelEditWizard,
    create: voltageLevelCreateWizard,
    select: emptyWizard,
  },
};
