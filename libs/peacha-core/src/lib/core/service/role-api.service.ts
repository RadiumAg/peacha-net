import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

export enum Role {
  Artist = 11002,
  Modeler = 11001,
}

export enum RoleApplyState {
  Waiting,
  Passed,
  Rejected,
  NotFound = 4,
}

interface RoleApplyRequest {
  r: Role;
  l: {
    w: number;
    f: string[];
  }[];
}

@Injectable()
export class RoleApiService {
  constructor(private http: HttpClient) {}

  /**
   * @author kinori
   * @param {Role} role
   * @memberof RoleApiService
   * @description 查询角色状态
   */
  findApply = (role: Role) =>
    this.http.get<{
      role: number;
      applytime: number;
      state: RoleApplyState;
    }>('/role/find_apply', {
      params: {
        r: role.toString(),
      },
    });

  /**
   * @author kinori
   * @param {RoleApplyRequest} roleApplyRequest
   * @memberof RoleApiService
   * @description 申请角色
   */
  applyRole = (roleApplyRequest: RoleApplyRequest) =>
    this.http.post('/role/apply_role', roleApplyRequest);
}
