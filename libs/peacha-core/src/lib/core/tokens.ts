import { InjectionToken } from '@angular/core';

export const API_GATEWAY = new InjectionToken<string>('api gateway');

export const PLATFORM_SERVER_REQUEST = new InjectionToken<string>('platform server request');

export const MODAL_DATA_TOKEN = new InjectionToken<any>('model_data');

export const SELECT_TOKEN = new InjectionToken<true>('select_token');

export const SELECT_DATA_TOKEN = new InjectionToken<true>('select_data_token');

export const FORM_NAV_TOKEN = new InjectionToken<boolean[]>('form_nam_token');
