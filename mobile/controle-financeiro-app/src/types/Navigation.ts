import type { Tx } from './Transactions'; 
import type { NavigatorScreenParams } from '@react-navigation/native';


export type DrawerParamList = {
    Dashboard: NavigatorScreenParams<DashboardStackParamList> | undefined;
    Prototype: undefined; 
    Statement: NavigatorScreenParams<StatementStackParamList> | undefined; 
    Test: undefined; 
    ManageCategories: undefined;
    ManagePaymentMethods: undefined;
};

export type StatementStackParamList = {
    StatementMain: undefined;
    TransactionDetail: Tx; 
    AddTransaction: undefined;
};

export type DashboardStackParamList = {
    DashboardMain: undefined;
    TransactionDetail: Tx; 
    AddTransaction: undefined;
};