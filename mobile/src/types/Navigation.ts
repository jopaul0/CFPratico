import type { Tx } from './Transactions'; 
import type { NavigatorScreenParams } from '@react-navigation/native';


export type DrawerParamList = {
    Dashboard: NavigatorScreenParams<DashboardStackParamList> | undefined;
    Statement: NavigatorScreenParams<StatementStackParamList> | undefined; 
    Settings: NavigatorScreenParams<SettingsStackParamList> | undefined;
};

export type StatementStackParamList = {
    StatementMain: undefined;
    TransactionDetail: Tx; 
    AddTransaction: undefined;
};

export type SettingsStackParamList = {
    SettingsMain: undefined;
    ManageCategories: undefined;
    ManagePaymentMethods: undefined;
    Help: undefined;
};

export type DashboardStackParamList = {
    DashboardMain: undefined;
    TransactionDetail: Tx; 
    AddTransaction: undefined;
};