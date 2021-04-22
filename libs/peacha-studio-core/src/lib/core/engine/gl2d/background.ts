import { loadImageFromUrl } from '@peacha-studio-core/vfs';

// eslint-disable-next-line max-len
const url = `data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI1MTIiIGhlaWdodD0iNTEyIiB2aWV3Qm94PSIwIDAgNTEyIDUxMiI+CiAgPGcgaWQ9Iue7hF8xMjc1IiBkYXRhLW5hbWU9Iue7hCAxMjc1IiB0cmFuc2Zvcm09InRyYW5zbGF0ZSg0ODcyIDEwOCkiPgogICAgPGcgaWQ9Iumhtemdoi0xIiB0cmFuc2Zvcm09InRyYW5zbGF0ZSgtNDg3MiAtMTA4KSI+CiAgICAgIDxnIGlkPSLnvJbnu4QtMiI+CiAgICAgICAgPHJlY3QgaWQ9IuefqeW9oiIgd2lkdGg9IjUxMS41MTgiIGhlaWdodD0iNTExLjUxOCIgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoMC4yNDEgMC4yNDEpIiBmaWxsPSIjZjdmN2Y3Ii8+CiAgICAgICAgPHBhdGggaWQ9IuW9oueKtue7k+WQiCIgZD0iTTI1Ny4yNDEsMFYyNTcuMjQxSDBWMFpNNzcuMTcyLDQ2LjNINTYuNTkzdjEwLjI5SDUxLjQ0OHYxMC4yOWgxMC4yOXYxMC4yOWgxMC4yOXY1LjE0NWgxMC4yOXY1LjE0NWgxMC4yOXY1LjE0NUgxMDIuOXY1LjE0NUg5Mi42MDdWMTAyLjlIODIuMzE3djEwLjI5SDcyLjAyOHYxMC4yOUg2MS43Mzh2MTAuMjlINTEuNDQ4djEwLjI5SDQ2LjN2MjAuNTc5aDUuMTQ1djEwLjI5aDUuMTQ1djEwLjI5aDUuMTQ1VjE5NS41aDEwLjI5djEwLjI5aDEwLjI5djUuMTQ1aDkyLjYwN3YtNS4xNDVoMTAuMjlWMTk1LjVIMTk1LjV2LTEwLjI5aDUuMTQ1di0xMC4yOWg1LjE0NXYtMTAuMjloNS4xNDVWMTQ0LjA1NWgtNS4xNDV2LTEwLjI5SDE5NS41di0xMC4yOWgtMTAuMjl2LTEwLjI5aC0xMC4yOVYxMDIuOWgtMTAuMjlWOTcuNzUyaC0xMC4yOVY5Mi42MDdoMTAuMjlWODcuNDYyaDEwLjI5VjgyLjMxN2gxMC4yOVY3Ny4xNzJIMTk1LjVWNjYuODgzaDEwLjI5VjU2LjU5M2gtNS4xNDVWNDYuM0gxODAuMDY5djUuMTQ1aC0xMC4yOXY1LjE0NUgxNTkuNDl2MTAuMjlIMTQ5LjJ2MTAuMjlIMTM4LjkxdjEwLjI5SDExOC4zMzFWNzcuMTcyaC0xMC4yOVY2Ni44ODNIOTcuNzUyVjU2LjU5M0g4Ny40NjJWNTEuNDQ4SDc3LjE3MlptMjkuNTgzLDExMS45VjE3Ny41SDk2LjQ2NVYxNTguMlptNTQuMDIxLDBWMTc3LjVoLTEwLjI5VjE1OC4yWiIgZmlsbD0iI2ZmYjhjYiIgZmlsbC1ydWxlPSJldmVub2RkIiBvcGFjaXR5PSIwLjUiLz4KICAgICAgICA8cGF0aCBpZD0i5b2i54q257uT5ZCI5aSH5Lu9LTIiIGQ9Ik00NTcuMjQxLDIwMFY0NTcuMjQxSDIwMFYyMDBaTTI3Ny4xNzIsMjQ2LjNIMjU2LjU5M3YxMC4yOWgtNS4xNDV2MTAuMjloMTAuMjl2MTAuMjloMTAuMjl2NS4xNDVoMTAuMjl2NS4xNDVoMTAuMjl2NS4xNDVIMzAyLjl2NS4xNDVoLTEwLjI5VjMwMi45aC0xMC4yOXYxMC4yOWgtMTAuMjl2MTAuMjloLTEwLjI5djEwLjI5aC0xMC4yOXYxMC4yOUgyNDYuM3YyMC41NzloNS4xNDV2MTAuMjloNS4xNDV2MTAuMjloNS4xNDVWMzk1LjVoMTAuMjl2MTAuMjloMTAuMjl2NS4xNDVoOTIuNjA3di01LjE0NWgxMC4yOVYzOTUuNUgzOTUuNXYtMTAuMjloNS4xNDV2LTEwLjI5aDUuMTQ1di0xMC4yOWg1LjE0NVYzNDQuMDU1aC01LjE0NXYtMTAuMjlIMzk1LjV2LTEwLjI5aC0xMC4yOXYtMTAuMjloLTEwLjI5VjMwMi45aC0xMC4yOXYtNS4xNDVoLTEwLjI5di01LjE0NWgxMC4yOXYtNS4xNDVoMTAuMjl2LTUuMTQ1aDEwLjI5di01LjE0NUgzOTUuNXYtMTAuMjloMTAuMjl2LTEwLjI5aC01LjE0NVYyNDYuM0gzODAuMDY5djUuMTQ1aC0xMC4yOXY1LjE0NUgzNTkuNDl2MTAuMjlIMzQ5LjJ2MTAuMjlIMzM4LjkxdjEwLjI5SDMxOC4zMzF2LTEwLjI5aC0xMC4yOXYtMTAuMjloLTEwLjI5di0xMC4yOWgtMTAuMjl2LTUuMTQ1aC0xMC4yOVptMjkuNTgzLDExMS45VjM3Ny41aC0xMC4yOVYzNTguMlptNTQuMDIxLDBWMzc3LjVoLTEwLjI5VjM1OC4yWiIgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoNTQuNzU5IDU0Ljc1OSkiIGZpbGw9IiNmZmI4Y2IiIGZpbGwtcnVsZT0iZXZlbm9kZCIgb3BhY2l0eT0iMC41Ii8+CiAgICAgICAgPGcgaWQ9Iue8lue7hCIgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoMzAxLjA2MiA0Ni4zMDMpIiBvcGFjaXR5PSIwLjUiPgogICAgICAgICAgPHBhdGggaWQ9IuW9oueKtue7k+WQiC0yIiBkYXRhLW5hbWU9IuW9oueKtue7k+WQiCIgZD0iTTk3Ljc1MiwzMnY1LjE0NWgxMC4yOVY0Mi4yOWgxMC4yOXY1LjE0NWgxMC4yOXYxMC4yOWgxMC4yOXYxMC4yOUgxNDkuMlY3OC4zaDEwLjI5djEwLjI5aDUuMTQ1djIwLjU3OUgxNTkuNDl2MTAuMjloLTUuMTQ1djEwLjI5SDE0OS4ydjEwLjI5SDEzOC45MXYxMC4yOWgtMTAuMjl2NS4xNDVIMzYuMDE0di01LjE0NUgyNS43MjR2LTEwLjI5SDE1LjQzNHYtMTAuMjlIMTAuMjl2LTEwLjI5SDUuMTQ1di0xMC4yOUgwVjg4LjU5M0g1LjE0NVY3OC4zaDEwLjI5VjY4LjAxNGgxMC4yOVY1Ny43MjRoMTAuMjlWNDcuNDM0SDQ2LjNWNDIuMjloMTAuMjlWMzcuMTQ1aDEwLjI5VjMyWiIgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoMCA5LjE1OSkiIGZpbGw9IiNmZmI4Y2IiIGZpbGwtcnVsZT0iZXZlbm9kZCIvPgogICAgICAgICAgPHBhdGggaWQ9IuW9oueKtue7k+WQiC0zIiBkYXRhLW5hbWU9IuW9oueKtue7k+WQiCIgZD0iTTQsMjAuNTc5VjEwLjI5SDkuMTQ1VjBIMjkuNzI0VjUuMTQ1aDEwLjI5VjEwLjI5SDUwLjN2MTAuMjloMTAuMjl2MTAuMjloMTAuMjl2MTAuMjlINjUuNzM4VjQ2LjNINDUuMTU5VjQxLjE1OUgzNC44NjlWMzYuMDE0SDI0LjU3OVYzMC44NjlIMTQuMjlWMjAuNTc5WiIgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoMS4xNDUpIiBmaWxsPSIjNmVlZWZmIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiLz4KICAgICAgICAgIDxwYXRoIGlkPSLlvaLnirbnu5PlkIjlpIfku70iIGQ9Ik0wLDI1LjcyNHYxMC4yOUg1LjE0NVY0Ni4zSDI1LjcyNFY0MS4xNTloMTAuMjlWMzYuMDE0SDQ2LjNWMjUuNzI0aDEwLjI5VjE1LjQzNGgxMC4yOVY1LjE0NUg2MS43MzhWMEg0MS4xNTlWNS4xNDVIMzAuODY5VjEwLjI5SDIwLjU3OXY1LjE0NUgxMC4yOXYxMC4yOVoiIHRyYW5zZm9ybT0idHJhbnNsYXRlKDE1OS40OSA0Ni4zMDMpIHJvdGF0ZSgxODApIiBmaWxsPSIjNmVlZWZmIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiLz4KICAgICAgICAgIDxyZWN0IGlkPSLnn6nlvaItMiIgZGF0YS1uYW1lPSLnn6nlvaIiIHdpZHRoPSIxMSIgaGVpZ2h0PSIxOSIgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoNDkuNjk2IDExMS45MzgpIiBmaWxsPSIjNGM0YzRjIi8+CiAgICAgICAgICA8cmVjdCBpZD0i55+p5b2i5aSH5Lu9LTgiIHdpZHRoPSIyMSIgaGVpZ2h0PSIxMCIgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoMzkuNjk2IDEzMy45MzgpIiBmaWxsPSIjZmY5NGI1Ii8+CiAgICAgICAgICA8cmVjdCBpZD0i55+p5b2i5aSH5Lu9LTkiIHdpZHRoPSIyMSIgaGVpZ2h0PSIxMCIgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoMTAzLjY5NiAxMzMuOTM4KSIgZmlsbD0iI2ZmOTRiNSIvPgogICAgICAgICAgPHJlY3QgaWQ9IuefqeW9ouWkh+S7vS03IiB3aWR0aD0iMTEiIGhlaWdodD0iMTkiIHRyYW5zZm9ybT0idHJhbnNsYXRlKDEwMy42OTYgMTExLjkzOCkiIGZpbGw9IiM0YzRjNGMiLz4KICAgICAgICA8L2c+CiAgICAgICAgPGcgaWQ9Iue8lue7hOWkh+S7vSIgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoNDYuMzAzIDMwMS4wNjIpIiBvcGFjaXR5PSIwLjUiPgogICAgICAgICAgPHBhdGggaWQ9IuW9oueKtue7k+WQiC00IiBkYXRhLW5hbWU9IuW9oueKtue7k+WQiCIgZD0iTTk3Ljc1MiwzMnY1LjE0NWgxMC4yOVY0Mi4yOWgxMC4yOXY1LjE0NWgxMC4yOXYxMC4yOWgxMC4yOXYxMC4yOUgxNDkuMlY3OC4zaDEwLjI5djEwLjI5aDUuMTQ1djIwLjU3OUgxNTkuNDl2MTAuMjloLTUuMTQ1djEwLjI5SDE0OS4ydjEwLjI5SDEzOC45MXYxMC4yOWgtMTAuMjl2NS4xNDVIMzYuMDE0di01LjE0NUgyNS43MjR2LTEwLjI5SDE1LjQzNHYtMTAuMjlIMTAuMjl2LTEwLjI5SDUuMTQ1di0xMC4yOUgwVjg4LjU5M0g1LjE0NVY3OC4zaDEwLjI5VjY4LjAxNGgxMC4yOVY1Ny43MjRoMTAuMjlWNDcuNDM0SDQ2LjNWNDIuMjloMTAuMjlWMzcuMTQ1aDEwLjI5VjMyWiIgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoMCA5LjE1OSkiIGZpbGw9IiNmZmI4Y2IiIGZpbGwtcnVsZT0iZXZlbm9kZCIvPgogICAgICAgICAgPHBhdGggaWQ9IuW9oueKtue7k+WQiC01IiBkYXRhLW5hbWU9IuW9oueKtue7k+WQiCIgZD0iTTQsMjAuNTc5VjEwLjI5SDkuMTQ1VjBIMjkuNzI0VjUuMTQ1aDEwLjI5VjEwLjI5SDUwLjN2MTAuMjloMTAuMjl2MTAuMjloMTAuMjl2MTAuMjlINjUuNzM4VjQ2LjNINDUuMTU5VjQxLjE1OUgzNC44NjlWMzYuMDE0SDI0LjU3OVYzMC44NjlIMTQuMjlWMjAuNTc5WiIgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoMS4xNDUpIiBmaWxsPSIjNmVlZWZmIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiLz4KICAgICAgICAgIDxwYXRoIGlkPSLlvaLnirbnu5PlkIjlpIfku70tMi0yIiBkYXRhLW5hbWU9IuW9oueKtue7k+WQiOWkh+S7vSIgZD0iTTAsMjUuNzI0djEwLjI5SDUuMTQ1VjQ2LjNIMjUuNzI0VjQxLjE1OWgxMC4yOVYzNi4wMTRINDYuM1YyNS43MjRoMTAuMjlWMTUuNDM0aDEwLjI5VjUuMTQ1SDYxLjczOFYwSDQxLjE1OVY1LjE0NUgzMC44NjlWMTAuMjlIMjAuNTc5djUuMTQ1SDEwLjI5djEwLjI5WiIgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoMTU5LjQ5IDQ2LjMwMykgcm90YXRlKDE4MCkiIGZpbGw9IiM2ZWVlZmYiIGZpbGwtcnVsZT0iZXZlbm9kZCIvPgogICAgICAgICAgPHJlY3QgaWQ9IuefqeW9oi0zIiBkYXRhLW5hbWU9IuefqeW9oiIgd2lkdGg9IjExIiBoZWlnaHQ9IjE5IiB0cmFuc2Zvcm09InRyYW5zbGF0ZSg0OS45MzggMTExLjY5NykiIGZpbGw9IiM0YzRjNGMiLz4KICAgICAgICAgIDxyZWN0IGlkPSLnn6nlvaLlpIfku70tOC0yIiBkYXRhLW5hbWU9IuefqeW9ouWkh+S7vS04IiB3aWR0aD0iMjEiIGhlaWdodD0iMTAiIHRyYW5zZm9ybT0idHJhbnNsYXRlKDM5LjkzOCAxMzMuNjk3KSIgZmlsbD0iI2ZmOTRiNSIvPgogICAgICAgICAgPHJlY3QgaWQ9IuefqeW9ouWkh+S7vS05LTIiIGRhdGEtbmFtZT0i55+p5b2i5aSH5Lu9LTkiIHdpZHRoPSIyMSIgaGVpZ2h0PSIxMCIgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoMTAzLjkzOCAxMzMuNjk3KSIgZmlsbD0iI2ZmOTRiNSIvPgogICAgICAgICAgPHJlY3QgaWQ9IuefqeW9ouWkh+S7vS03LTIiIGRhdGEtbmFtZT0i55+p5b2i5aSH5Lu9LTciIHdpZHRoPSIxMSIgaGVpZ2h0PSIxOSIgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoMTAzLjkzOCAxMTEuNjk3KSIgZmlsbD0iIzRjNGM0YyIvPgogICAgICAgIDwvZz4KICAgICAgPC9nPgogICAgPC9nPgogICAgPHJlY3QgaWQ9IuefqeW9ol8xMzIxIiBkYXRhLW5hbWU9IuefqeW9oiAxMzIxIiB3aWR0aD0iMzIxIiBoZWlnaHQ9IjEwOSIgcng9IjU0LjUiIHRyYW5zZm9ybT0idHJhbnNsYXRlKC00Nzc2Ljc1OSA5My4yNDEpIiBmaWxsPSIjZmJkN2UxIi8+CiAgICA8dGV4dCBpZD0iUGVhY2hh5qih5Z6L6aKE6KeI5LiT55SoIiB0cmFuc2Zvcm09InRyYW5zbGF0ZSgtNDYxOS43NTkgMTM4LjI0MSkiIGZpbGw9IiNmN2Y3ZjciIGZvbnQtc2l6ZT0iMjUiIGZvbnQtZmFtaWx5PSJTb3VyY2VIYW5TYW5zQ04tQm9sZCwgU291cmNlIEhhbiBTYW5zIENOIiBmb250LXdlaWdodD0iNzAwIj48dHNwYW4geD0iLTExOS40NzUiIHk9IjAiPlBlYWNoYeaooeWei+mihOiniOS4k+eUqDwvdHNwYW4+PC90ZXh0PgogICAgPHRleHQgaWQ9Iuivt+WLv+eUqOS6juWFtuS7lueUqOmAlCIgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoLTQ2MTguNzU5IDE3Ni4yNDEpIiBmaWxsPSIjZjdmN2Y3IiBmb250LXNpemU9IjI1IiBmb250LWZhbWlseT0iU291cmNlSGFuU2Fuc0NOLUJvbGQsIFNvdXJjZSBIYW4gU2FucyBDTiIgZm9udC13ZWlnaHQ9IjcwMCI+PHRzcGFuIHg9Ii0xMDAiIHk9IjAiPuivt+WLv+eUqOS6juWFtuS7lueUqOmAlDwvdHNwYW4+PC90ZXh0PgogIDwvZz4KPC9zdmc+Cg==`;
export function loadBackground(callback: (img: HTMLImageElement) => void) {
	loadImageFromUrl(url).then(callback);
}