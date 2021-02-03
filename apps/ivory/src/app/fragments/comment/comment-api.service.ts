import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ModelComment, ModelSubComment } from './model';


@Injectable()
export class CommentApiService {
    constructor(private http: HttpClient) { }

    /**
     *
     * @name 一级评论
     *
     * @param  a 评论区ID
     * @param  c 评论内容
     *
     * @author ding
     *
     * @description
     *
     * @version 2021/2/3
     */
    public firstLevelComments = (a: number, c: string) =>
        this.http.post<{
            id: number
        }>(`/comment/comment`, {
            a,
            c
        });



    /**
    *
    * @name 回复评论
    *
    * @param  c 评论内容
    * @param  r 被回复的评论Id
    *
    * @author ding
    *
    * @description
    *
    * @version 2021/2/3
    */
    public replyToComments = (c: string, r: number) =>
        this.http.post<{
            id: number
        }>(`/comment/comment_sub`, {
            c,
            r
        });


    /**
    *
    * @name 点赞/取消点赞评论
    *
    * @param  c 评论ID
    *
    * @author ding
    *
    * @description
    *
    * @version 2021/2/3
    */
    public commentLike = (c: number) =>
        this.http.post<{
            id: number
        }>(`/comment/like`, {
            c
        });


    /**
    *
    * @name 回复页码
    *
    * @param  c 评论ID
    *
    * @author ding
    *
    * @description
    *
    * @version 2021/2/3
    */
    public commentReplyJump = (c: number) =>
        this.http.post<{
            rootid: number;
            root_index: number,
            sub_index: number
        }>(`/comment/reply_jump`, {
            c
        });



    /**
    *
    * @name 删除一级评论
    *
    * @param  c 评论ID
    *
    * @author ding
    *
    * @description
    *
    * @version 2021/2/3
    */
    public commentDelete = (c: number) =>
        this.http.post(`/comment/delete`, {
            c
        });


    /**
     *
     * @name 删除回复评论
     *
     * @param  c 评论ID
     *
     * @author ding
     *
     * @description
     *
     * @version 2021/2/3
     */
    public commentDeleteSub = (c: number) =>
        this.http.post(`/comment/delete_sub`, {
            c
        });



    /**
     *
     * @name 获取一级评论
     *
     * @param  c 评论区ID
     * @param  p 页码
     * @param  s 页大小
     *
     * @author ding
     *
     * @description
     *
     * @version 2021/2/3
     */
    public getFirstLevelComments = (c: number, p: number, s: number) =>
        this.http.get<{
            count: number;
            list: ModelComment[];
        }>(`/comment/get_comment?c=${c}&p=${p}&s=${s}`);



    /**
    *
    * @name 获取二级评论
    *
    * @param  c 根评论ID
    * @param  p 页码
    * @param  s 页大小
    *
    * @author ding
    *
    * @description
    *
    * @version 2021/2/3
    */
    public getReplyToComments = (c: number, p: number, s: number) =>
        this.http.get<{
            count: number;
            list: ModelSubComment[];
        }>(`/comment/get_comment_sub?c=${c}&p=${p}&s=${s}`);


}