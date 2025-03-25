//----------------------
// <auto-generated>
//     Generated using the NSwag toolchain v14.1.0.0 (NJsonSchema v11.0.2.0 (Newtonsoft.Json v13.0.0.0)) (http://NSwag.org)
// </auto-generated>
//----------------------

/* tslint:disable */
/* eslint-disable */
// ReSharper disable InconsistentNaming

import axios, { AxiosError } from 'axios';
import type { AxiosInstance, AxiosRequestConfig, AxiosResponse, CancelToken } from 'axios';

export class SystemSettingsClient {
    protected instance: AxiosInstance;
    protected baseUrl: string;
    protected jsonParseReviver: ((key: string, value: any) => any) | undefined = undefined;

    constructor(baseUrl?: string, instance?: AxiosInstance) {

        this.instance = instance || axios.create();

        this.baseUrl = baseUrl ?? "";

    }

    /**
     * @param group (optional) 
     * @param branchIdHeader (optional) 
     * @return Success
     */
    getList(group: string | undefined, branchIdHeader: string | undefined, signal?: AbortSignal): Promise<SystemSettingDto[]> {
        let url_ = this.baseUrl + "/api/SystemSettings/SystemSettings/GetList?";
        if (group === null)
            throw new Error("The parameter 'group' cannot be null.");
        else if (group !== undefined)
            url_ += "group=" + encodeURIComponent("" + group) + "&";
        url_ = url_.replace(/[?&]$/, "");

        let options_: AxiosRequestConfig = {
            method: "GET",
            url: url_,
            headers: {
                "BranchIdHeader": branchIdHeader !== undefined && branchIdHeader !== null ? "" + branchIdHeader : "",
                "Accept": "text/plain"
            },
            signal
        };

        return this.instance.request(options_).catch((_error: any) => {
            if (isAxiosError(_error) && _error.response) {
                return _error.response;
            } else {
                throw _error;
            }
        }).then((_response: AxiosResponse) => {
            return this.processGetList(_response);
        });
    }

    protected processGetList(response: AxiosResponse): Promise<SystemSettingDto[]> {
        const status = response.status;
        let _headers: any = {};
        if (response.headers && typeof response.headers === "object") {
            for (const k in response.headers) {
                if (response.headers.hasOwnProperty(k)) {
                    _headers[k] = response.headers[k];
                }
            }
        }
        if (status === 200) {
            const _responseText = response.data;
            let result200: any = null;
            let resultData200  = _responseText;
            result200 = JSON.parse(resultData200);
            return Promise.resolve<SystemSettingDto[]>(result200);

        } else if (status !== 200 && status !== 204) {
            const _responseText = response.data;
            return throwException("An unexpected server error occurred.", status, _responseText, _headers);
        }
        return Promise.resolve<SystemSettingDto[]>(null as any);
    }

    /**
     * @param id (optional) 
     * @param branchIdHeader (optional) 
     * @return Success
     */
    getToUpdate(id: number | undefined, branchIdHeader: string | undefined, signal?: AbortSignal): Promise<SystemSettingForUpdateDto> {
        let url_ = this.baseUrl + "/api/SystemSettings/SystemSettings/GetToUpdate?";
        if (id === null)
            throw new Error("The parameter 'id' cannot be null.");
        else if (id !== undefined)
            url_ += "id=" + encodeURIComponent("" + id) + "&";
        url_ = url_.replace(/[?&]$/, "");

        let options_: AxiosRequestConfig = {
            method: "GET",
            url: url_,
            headers: {
                "BranchIdHeader": branchIdHeader !== undefined && branchIdHeader !== null ? "" + branchIdHeader : "",
                "Accept": "text/plain"
            },
            signal
        };

        return this.instance.request(options_).catch((_error: any) => {
            if (isAxiosError(_error) && _error.response) {
                return _error.response;
            } else {
                throw _error;
            }
        }).then((_response: AxiosResponse) => {
            return this.processGetToUpdate(_response);
        });
    }

    protected processGetToUpdate(response: AxiosResponse): Promise<SystemSettingForUpdateDto> {
        const status = response.status;
        let _headers: any = {};
        if (response.headers && typeof response.headers === "object") {
            for (const k in response.headers) {
                if (response.headers.hasOwnProperty(k)) {
                    _headers[k] = response.headers[k];
                }
            }
        }
        if (status === 200) {
            const _responseText = response.data;
            let result200: any = null;
            let resultData200  = _responseText;
            result200 = JSON.parse(resultData200);
            return Promise.resolve<SystemSettingForUpdateDto>(result200);

        } else if (status !== 200 && status !== 204) {
            const _responseText = response.data;
            return throwException("An unexpected server error occurred.", status, _responseText, _headers);
        }
        return Promise.resolve<SystemSettingForUpdateDto>(null as any);
    }

    /**
     * @param branchIdHeader (optional) 
     * @param body (optional) 
     * @return Success
     */
    updateValue(branchIdHeader: string | undefined, body: UpdateSettingModel | undefined, signal?: AbortSignal): Promise<void> {
        let url_ = this.baseUrl + "/api/SystemSettings/SystemSettings/UpdateValue";
        url_ = url_.replace(/[?&]$/, "");

        const content_ = JSON.stringify(body);

        let options_: AxiosRequestConfig = {
            data: content_,
            method: "PUT",
            url: url_,
            headers: {
                "BranchIdHeader": branchIdHeader !== undefined && branchIdHeader !== null ? "" + branchIdHeader : "",
                "Content-Type": "application/json",
            },
            signal
        };

        return this.instance.request(options_).catch((_error: any) => {
            if (isAxiosError(_error) && _error.response) {
                return _error.response;
            } else {
                throw _error;
            }
        }).then((_response: AxiosResponse) => {
            return this.processUpdateValue(_response);
        });
    }

    protected processUpdateValue(response: AxiosResponse): Promise<void> {
        const status = response.status;
        let _headers: any = {};
        if (response.headers && typeof response.headers === "object") {
            for (const k in response.headers) {
                if (response.headers.hasOwnProperty(k)) {
                    _headers[k] = response.headers[k];
                }
            }
        }
        if (status === 200) {
            const _responseText = response.data;
            return Promise.resolve<void>(null as any);

        } else if (status !== 200 && status !== 204) {
            const _responseText = response.data;
            return throwException("An unexpected server error occurred.", status, _responseText, _headers);
        }
        return Promise.resolve<void>(null as any);
    }

    /**
     * @param key (optional) 
     * @param branchIdHeader (optional) 
     * @return Success
     */
    getSettingValueByKey(key: string | undefined, branchIdHeader: string | undefined, signal?: AbortSignal): Promise<string> {
        let url_ = this.baseUrl + "/api/SystemSettings/SystemSettings/GetSettingValueByKey?";
        if (key === null)
            throw new Error("The parameter 'key' cannot be null.");
        else if (key !== undefined)
            url_ += "key=" + encodeURIComponent("" + key) + "&";
        url_ = url_.replace(/[?&]$/, "");

        let options_: AxiosRequestConfig = {
            method: "GET",
            url: url_,
            headers: {
                "BranchIdHeader": branchIdHeader !== undefined && branchIdHeader !== null ? "" + branchIdHeader : "",
                "Accept": "text/plain"
            },
            signal
        };

        return this.instance.request(options_).catch((_error: any) => {
            if (isAxiosError(_error) && _error.response) {
                return _error.response;
            } else {
                throw _error;
            }
        }).then((_response: AxiosResponse) => {
            return this.processGetSettingValueByKey(_response);
        });
    }

    protected processGetSettingValueByKey(response: AxiosResponse): Promise<string> {
        const status = response.status;
        let _headers: any = {};
        if (response.headers && typeof response.headers === "object") {
            for (const k in response.headers) {
                if (response.headers.hasOwnProperty(k)) {
                    _headers[k] = response.headers[k];
                }
            }
        }
        if (status === 200) {
            const _responseText = response.data;
            let result200: any = null;
            let resultData200  = _responseText;
            result200 = JSON.parse(resultData200);
            return Promise.resolve<string>(result200);

        } else if (status !== 200 && status !== 204) {
            const _responseText = response.data;
            return throwException("An unexpected server error occurred.", status, _responseText, _headers);
        }
        return Promise.resolve<string>(null as any);
    }
}

export enum DataTypes {
    Text = "Text",
    TextArea = "TextArea",
    SecureText = "SecureText",
    Number = "Number",
    Decimal = "Decimal",
    Percentage = "Percentage",
    DateOnly = "DateOnly",
    TimeOnly = "TimeOnly",
    DateTime = "DateTime",
    ScreeningResult = "ScreeningResult",
    Boolean = "Boolean",
    CustomLookup = "CustomLookup",
    Country = "Country",
    CustomerType = "CustomerType",
    CustomerSubType = "CustomerSubType",
    Purpose = "Purpose",
    Currency = "Currency",
    Activity = "Activity",
    Nationality = "Nationality",
    IdentityType = "IdentityType",
    SourceOfFund = "SourceOfFund",
    DeliveryMethod = "DeliveryMethod",
    Relation = "Relation",
    AddressType = "AddressType",
    DelegationType = "DelegationType",
    Gender = "Gender",
    Industry = "Industry",
    LiabilityType = "LiabilityType",
    OwnershipType = "OwnershipType",
    PartnershipType = "PartnershipType",
    Profession = "Profession",
    ResidencyType = "ResidencyType",
    Product = "Product",
    CustomerStatus = "CustomerStatus",
    Channel = "Channel",
    PaymentMode = "PaymentMode",
    Account = "Account",
    AggregateAccount = "AggregateAccount",
    JournalAccount = "JournalAccount",
}

export interface SystemSettingDto {
    id?: number;
    displayOrder?: number;
    name?: string | null;
    key?: string | null;
    value?: string | null;
    group?: string | null;
    dataType?: DataTypes;
    description?: string | null;
    isSystemControlled?: boolean;
    valuesList?: string[] | null;
}

export interface SystemSettingForUpdateDto {
    id?: number;
    displayOrder?: number;
    name?: string | null;
    nameLang?: string | null;
    key?: string | null;
    value?: string | null;
    group?: string | null;
    dataType?: DataTypes;
    description?: string | null;
    descriptionLang?: string | null;
    valuesList?: string[] | null;
}

export interface UpdateSettingModel {
    id?: number;
    value?: string | null;
}

export class ApiException extends Error {
    override message: string;
    status: number;
    response: string;
    headers: { [key: string]: any; };
    result: any;

    constructor(message: string, status: number, response: string, headers: { [key: string]: any; }, result: any) {
        super();

        this.message = message;
        this.status = status;
        this.response = response;
        this.headers = headers;
        this.result = result;
    }

    protected isApiException = true;

    static isApiException(obj: any): obj is ApiException {
        return obj.isApiException === true;
    }
}

function throwException(message: string, status: number, response: string, headers: { [key: string]: any; }, result?: any): any {
    if (result !== null && result !== undefined)
        throw result;
    else
        throw new ApiException(message, status, response, headers, null);
}

function isAxiosError(obj: any): obj is AxiosError {
    return obj && obj.isAxiosError === true;
}