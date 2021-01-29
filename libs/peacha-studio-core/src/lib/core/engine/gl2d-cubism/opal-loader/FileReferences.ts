import {
	CubismCDIJson,
	CubismModelJson,
	Input,
	Output,
	Vertex,
	PhyscicsDictionaty,
	NormalizationValue,
	ExpressionParameter,
	CubismPoseJson,
	CubismExpJson,
	CubismMotionJson,
	CubismPhysicsJson,
	CubismUserDataJson,
	Curve,
	UserData,
	MotionUserData,
} from './structures';
// tslint:disable: no-shadowed-variable

export class FileReferences {
	public moc3: ArrayBuffer;
	public textures: ArrayBuffer[];
	public pose3: CubismPoseJson;
	public exp3: CubismExpJson[] = [];
	public motions: CubismMotionJson[] = [];
	public physics3: CubismPhysicsJson;
	public cdi3: CubismCDIJson;
	public userData3: CubismUserDataJson;
	public model3: CubismModelJson;
	public cfgs: ArrayBuffer[];
	ab2str(buffer: ArrayBuffer): string {
		const utf8decoder = new TextDecoder();
		return utf8decoder.decode(buffer);
	}
	constructor(data: ArrayBuffer) {
		let offset = 0;
		offset += 4;
		const view = new DataView(data);
		const moc3Size = view.getInt32(offset, true);
		offset += 4;
		if (moc3Size > -1) {
			const arr = new Uint8Array(data.slice(offset, (offset += moc3Size)));
			this.moc3 = arr.buffer;
		}
		const texturesSize = view.getInt32(offset, true);
		offset += 4;
		if (texturesSize > -1) {
			this.textures = [];
			for (let index = 0; index < texturesSize; index++) {
				const textureSize = view.getInt32(offset, true);
				offset += 4;
				if (textureSize > -1) {
					this.textures.push(data.slice(offset, (offset += textureSize)));
				}
			}
		}
		const pose3Size = view.getInt32(offset, true);
		offset += 4;
		if (pose3Size > -1) {
			const FadeInTime = view.getFloat64(offset, true);
			offset += 8;
			const typeStrSize = view.getInt32(offset, true);
			offset += 4;
			let Type: string;
			if (typeStrSize > -1) {
				Type = this.ab2str(data.slice(offset, (offset += typeStrSize)));
			}
			const groupsStrSize = view.getInt32(offset, true);
			offset += 4;
			let groupsStr: string;
			if (groupsStrSize > -1) {
				groupsStr = this.ab2str(data.slice(offset, (offset += groupsStrSize)));
			}
			const Groups = JSON.parse(groupsStr);
			this.pose3 = {
				Type,
				FadeInTime,
				Groups,
			};
		}
		const exp3Size = view.getInt32(offset, true);
		offset += 4;
		if (exp3Size > -1) {
			for (let index = 0; index < exp3Size; index++) {
				offset += 4;
				const FadeInTime = view.getFloat64(offset, true);
				offset += 8;
				const FadeOutTime = view.getFloat64(offset, true);
				offset += 8;
				const typeSize = view.getInt32(offset, true);
				offset += 4;
				let Type: string;
				if (typeSize > -1) {
					Type = this.ab2str(data.slice(offset, (offset += typeSize)));
				}
				let Parameters: ExpressionParameter[];
				const parametersSize = view.getInt32(offset, true);
				offset += 4;
				if (parametersSize > -1) {
					Parameters = [];
					for (let index = 0; index < parametersSize; index++) {
						offset += 4;
						const idSize = view.getInt32(offset, true);
						offset += 4;
						let Id: string;
						if (idSize > -1) {
							Id = this.ab2str(data.slice(offset, (offset += idSize)));
						}
						const Value = view.getFloat64(offset, true);
						offset += 8;
						const blendSize = view.getInt32(offset, true);
						offset += 4;
						let Blend: string;
						if (blendSize > -1) {
							Blend = this.ab2str(data.slice(offset, (offset += blendSize)));
						}
						Parameters.push({
							Id,
							Value,
							Blend,
						});
					}
				}
				this.exp3.push({
					FadeInTime,
					FadeOutTime,
					Type,
					Parameters,
				});
			}
		}
		const motion3Size = view.getInt32(offset, true);
		offset += 4;
		if (motion3Size > -1) {
			for (let index = 0; index < motion3Size; index++) {
				offset += 4;
				const Version = view.getInt32(offset, true);
				offset += 4;
				offset += 4;
				const AreBeziersRestricted = !!view.getUint8(offset);
				offset += 1;
				const Loop = !!view.getUint8(offset);
				offset += 1;
				const Duration = view.getFloat64(offset, true);
				offset += 8;
				const Fps = view.getFloat64(offset, true);
				offset += 8;
				const FadeInTime = view.getFloat64(offset, true);
				offset += 8;
				const FadeOutTime = view.getFloat64(offset, true);
				offset += 8;
				const CurveCount = view.getInt32(offset, true);
				offset += 4;
				const TotalSegmentCount = view.getInt32(offset, true);
				offset += 4;
				const TotalPointCount = view.getInt32(offset, true);
				offset += 4;
				const UserDataCount = view.getInt32(offset, true);
				offset += 4;
				const TotalUserDataSize = view.getInt32(offset, true);
				offset += 4;

				let Curves: Curve[];
				const curvesSize = view.getInt32(offset, true);
				offset += 4;
				if (curvesSize > -1) {
					Curves = [];
					for (let index = 0; index < curvesSize; index++) {
						offset += 4;
						const FadeInTime = view.getFloat64(offset, true);
						offset += 8;
						const FadeOutTime = view.getFloat64(offset, true);
						offset += 8;

						let Segments: number[];
						const segmentsSize = view.getInt32(offset, true);
						offset += 4;
						if (segmentsSize > -1) {
							Segments = [];
							for (let index = 0; index < segmentsSize; index++) {
								Segments.push(view.getFloat64(offset, true));
								offset += 8;
							}
						}

						const targetSize = view.getInt32(offset, true);
						offset += 4;
						let Target: string;
						if (targetSize > -1) {
							Target = this.ab2str(data.slice(offset, (offset += targetSize)));
						}

						const idSize = view.getInt32(offset, true);
						offset += 4;
						let Id: string;
						if (idSize > -1) {
							Id = this.ab2str(data.slice(offset, (offset += idSize)));
						}

						Curves.push({
							FadeInTime,
							FadeOutTime,
							Segments,
							Target,
							Id,
						});
					}
				}

				let UserData: MotionUserData[];
				const userDataSize = view.getInt32(offset, true);
				offset += 4;

				if (userDataSize > -1) {
					UserData = [];
					for (let index = 0; index < userDataSize; index++) {
						offset += 4;
						const Time = view.getFloat64(offset, true);
						offset += 8;
						const valueSize = view.getInt32(offset, true);
						offset += 4;
						let Value: string;
						if (valueSize > -1) {
							Value = this.ab2str(data.slice(offset, (offset += valueSize)));
						}
						UserData.push({
							Time,
							Value,
						});
					}
				}

				this.motions.push({
					Version,
					Meta: {
						AreBeziersRestricted,
						Loop,
						Duration,
						Fps,
						FadeInTime,
						FadeOutTime,
						CurveCount,
						TotalPointCount,
						TotalSegmentCount,
						TotalUserDataSize,
						UserDataCount,
					},
					Curves,
					UserData,
				});
			}
		}
		const physics3Size = view.getInt32(offset, true);
		offset += 4;
		if (physics3Size > -1) {
			const Version = view.getInt32(offset, true);
			offset += 4;
			offset += 4;
			const PhysicsSettingCount = view.getInt32(offset, true);
			offset += 4;
			const TotalInputCount = view.getInt32(offset, true);
			offset += 4;
			const TotalOutputCount = view.getInt32(offset, true);
			offset += 4;
			const VertexCount = view.getInt32(offset, true);
			offset += 4;
			offset += 4;
			offset += 4;
			const GravityX = view.getFloat64(offset, true);
			offset += 8;
			const GravityY = view.getFloat64(offset, true);
			offset += 8;
			offset += 4;
			const WindX = view.getFloat64(offset, true);
			offset += 8;
			const WindY = view.getFloat64(offset, true);
			offset += 8;
			const physicsDictionarySize = view.getInt32(offset, true);
			offset += 4;
			let PhysicsDictionary: PhyscicsDictionaty[];
			if (physicsDictionarySize > -1) {
				PhysicsDictionary = [];
				for (let index = 0; index < physicsDictionarySize; index++) {
					offset += 4;
					const idSize = view.getInt32(offset, true);
					offset += 4;
					let Id: string;
					if (idSize > -1) {
						Id = this.ab2str(data.slice(offset, (offset += idSize)));
					}
					const nameSize = view.getInt32(offset, true);
					offset += 4;
					let Name: string;
					if (nameSize > -1) {
						Name = this.ab2str(data.slice(offset, (offset += nameSize)));
					}
					PhysicsDictionary.push({
						Id,
						Name,
					});
				}
			}

			const physicsSettingsSize = view.getInt32(offset, true);
			offset += 4;
			let PhysicsSettings: {
				Id: string;
				Input: Input[];
				Output: Output[];
				Vertices: Vertex[];
				Normalization: {
					Position: NormalizationValue;
					Angle: NormalizationValue;
				};
			}[];
			if (physicsSettingsSize > -1) {
				PhysicsSettings = [];
				for (let index = 0; index < physicsSettingsSize; index++) {
					offset += 4;
					const idSize = view.getInt32(offset, true);
					offset += 4;
					let Id: string;
					if (idSize > -1) {
						Id = this.ab2str(data.slice(offset, (offset += idSize)));
					}
					offset += 4;
					offset += 4;
					const PositionMinimum = view.getFloat64(offset, true);
					offset += 8;
					const PositionDefault = view.getFloat64(offset, true);
					offset += 8;
					const PositionMaximum = view.getFloat64(offset, true);
					offset += 8;
					offset += 4;
					const AngleMinimum = view.getFloat64(offset, true);
					offset += 8;
					const AngleDefault = view.getFloat64(offset, true);
					offset += 8;
					const AngleMaximum = view.getFloat64(offset, true);
					offset += 8;

					const inputSize = view.getInt32(offset, true);
					offset += 4;
					let Input: Input[];
					if (inputSize > -1) {
						Input = [];
						for (let index = 0; index < inputSize; index++) {
							offset += 4;
							const Reflect = !!view.getUint8(offset);
							offset += 1;
							const Weight = view.getFloat64(offset, true);
							offset += 8;
							const typeSize = view.getInt32(offset, true);
							offset += 4;
							let Type: string;
							if (typeSize > -1) {
								Type = this.ab2str(data.slice(offset, (offset += typeSize)));
							}
							offset += 4;
							const targetSize = view.getInt32(offset, true);
							offset += 4;
							let Target: string;
							if (targetSize > -1) {
								Target = this.ab2str(data.slice(offset, (offset += targetSize)));
							}
							const idSize = view.getInt32(offset, true);
							offset += 4;
							let Id: string;
							if (idSize > -1) {
								Id = this.ab2str(data.slice(offset, (offset += idSize)));
							}
							Input.push({
								Reflect,
								Weight,
								Type,
								Source: {
									Target,
									Id,
								},
							});
						}
					}
					const outputSize = view.getInt32(offset, true);
					offset += 4;
					let Output: Output[];
					if (outputSize > -1) {
						Output = [];
						for (let index = 0; index < outputSize; index++) {
							offset += 4;
							const Reflect = !!view.getUint8(offset);
							offset += 1;
							const VertexIndex = view.getInt32(offset, true);
							offset += 4;
							const Scale = view.getFloat64(offset, true);
							offset += 8;
							const Weight = view.getFloat64(offset, true);
							offset += 8;
							const typeSize = view.getInt32(offset, true);
							offset += 4;
							let Type: string;
							if (typeSize > -1) {
								Type = this.ab2str(data.slice(offset, (offset += typeSize)));
							}
							offset += 4;
							const targetSize = view.getInt32(offset, true);
							offset += 4;
							let Target: string;
							if (targetSize > -1) {
								Target = this.ab2str(data.slice(offset, (offset += targetSize)));
							}
							const idSize = view.getInt32(offset, true);
							offset += 4;
							let Id: string;
							if (idSize > -1) {
								Id = this.ab2str(data.slice(offset, (offset += idSize)));
							}
							Output.push({
								Reflect,
								VertexIndex,
								Scale,
								Weight,
								Type,
								Destination: {
									Target,
									Id,
								},
							});
						}
					}

					const verticesSize = view.getInt32(offset, true);
					offset += 4;
					let Vertices: Vertex[];
					if (verticesSize > -1) {
						Vertices = [];
						for (let index = 0; index < verticesSize; index++) {
							offset += 4;
							const Mobility = view.getFloat64(offset, true);
							offset += 8;
							const Delay = view.getFloat64(offset, true);
							offset += 8;
							const Acceleration = view.getFloat64(offset, true);
							offset += 8;
							const Radius = view.getFloat64(offset, true);
							offset += 8;
							offset += 4;
							const X = view.getFloat64(offset, true);
							offset += 8;
							const Y = view.getFloat64(offset, true);
							offset += 8;
							Vertices.push({
								Mobility,
								Delay,
								Acceleration,
								Radius,
								Position: {
									X,
									Y,
								},
							});
						}
					}
					PhysicsSettings.push({
						Id,
						Normalization: {
							Position: {
								Minimum: PositionMinimum,
								Default: PositionDefault,
								Maximum: PositionMaximum,
							},
							Angle: {
								Minimum: AngleMinimum,
								Default: AngleDefault,
								Maximum: AngleMaximum,
							},
						},
						Input,
						Output,
						Vertices,
					});
				}
			}
			this.physics3 = {
				Version,
				Meta: {
					PhysicsSettingCount,
					TotalInputCount,
					TotalOutputCount,
					VertexCount,
					EffectiveForces: {
						Gravity: {
							X: GravityX,
							Y: GravityY,
						},
						Wind: {
							X: WindX,
							Y: WindY,
						},
					},
					PhysicsDictionary,
				},
				PhysicsSettings,
			};
		}
		const cdi3Size = view.getInt32(offset, true);
		offset += 4;
		if (cdi3Size > -1) {
			const Version = view.getInt32(offset, true);
			offset += 4;
			const parameterGroupsSize = view.getInt32(offset, true);
			offset += 4;
			let ParameterGroups: {
				Id: string;
				GroupId: string;
				Name: string;
			}[];
			if (parameterGroupsSize > -1) {
				ParameterGroups = [];
				for (let index = 0; index < parameterGroupsSize; index++) {
					offset += 4;
					const idSize = view.getInt32(offset, true);
					offset += 4;
					let Id: string;
					if (idSize > -1) {
						Id = this.ab2str(data.slice(offset, (offset += idSize)));
					}
					const nameSize = view.getInt32(offset, true);
					offset += 4;
					let Name: string;
					if (nameSize > -1) {
						Name = this.ab2str(data.slice(offset, (offset += nameSize)));
					}
					const groupIdSize = view.getInt32(offset, true);
					offset += 4;
					let GroupId: string;
					if (groupIdSize > -1) {
						GroupId = this.ab2str(data.slice(offset, (offset += groupIdSize)));
					}
					ParameterGroups.push({
						Id,
						Name,
						GroupId,
					});
				}
			}
			const parametersSize = view.getInt32(offset, true);
			offset += 4;
			let Parameters: {
				Id: string;
				Name: string;
				GroupId: string;
			}[];
			if (parametersSize > -1) {
				Parameters = [];
				for (let index = 0; index < parametersSize; index++) {
					offset += 4;
					const idSize = view.getInt32(offset, true);
					offset += 4;
					let Id: string;
					if (idSize > -1) {
						Id = this.ab2str(data.slice(offset, (offset += idSize)));
					}
					const nameSize = view.getInt32(offset, true);
					offset += 4;
					let Name: string;
					if (nameSize > -1) {
						Name = this.ab2str(data.slice(offset, (offset += nameSize)));
					}
					const groupIdSize = view.getInt32(offset, true);
					offset += 4;
					let GroupId: string;
					if (groupIdSize > -1) {
						GroupId = this.ab2str(data.slice(offset, (offset += groupIdSize)));
					}
					Parameters.push({
						Id,
						Name,
						GroupId,
					});
				}
			}
			const partsSize = view.getInt32(offset, true);
			offset += 4;
			let Parts: {
				Id: string;
				Name: string;
			}[];
			if (partsSize > -1) {
				Parts = [];
				for (let index = 0; index < partsSize; index++) {
					offset += 4;
					const idSize = view.getInt32(offset, true);
					offset += 4;
					let Id: string;
					if (idSize > -1) {
						Id = this.ab2str(data.slice(offset, (offset += idSize)));
					}
					const nameSize = view.getInt32(offset, true);
					offset += 4;
					let Name: string;
					if (nameSize > -1) {
						Name = this.ab2str(data.slice(offset, (offset += nameSize)));
					}
					Parts.push({
						Id,
						Name,
					});
				}
			}
			this.cdi3 = {
				Version,
				ParameterGroups,
				Parameters,
				Parts,
			};
		}
		const userDataSize = view.getInt32(offset, true);
		offset += 4;
		if (userDataSize > -1) {
			const Version = view.getInt32(offset, true);
			offset += 4;
			offset += 4;
			const UserDataCount = view.getInt32(offset, true);
			offset += 4;
			const TotalUserDataSize = view.getInt32(offset, true);
			offset += 4;

			const userDataItemSize = view.getInt32(offset, true);
			offset += 4;
			let userDataItems: UserData[];
			if (userDataItemSize > -1) {
				userDataItems = [];
				for (let index = 0; index < userDataItemSize; index++) {
					offset += 4;
					const targetSize = view.getInt32(offset, true);
					offset += 4;
					let Target: string;
					if (targetSize > -1) {
						Target = this.ab2str(data.slice(offset, (offset += targetSize)));
					}

					const idSize = view.getInt32(offset, true);
					offset += 4;
					let Id: string;
					if (idSize > -1) {
						Id = this.ab2str(data.slice(offset, (offset += idSize)));
					}
					const valueSize = view.getInt32(offset, true);
					offset += 4;
					let Value: string;
					if (valueSize > -1) {
						Value = this.ab2str(data.slice(offset, (offset += valueSize)));
					}
					userDataItems.push({
						Target,
						Id,
						Value,
					});
				}
				this.userData3 = {
					Version,
					Meta: {
						UserDataCount,
						TotalUserDataSize,
					},
					UserData: userDataItems,
				};
			}
		}
		const model3Size = view.getInt32(offset, true);
		offset += 4;
		if (model3Size > -1) {
			const Version = view.getInt32(offset, true);
			offset += 4;
			offset += 4;

			const mocSize = view.getInt32(offset, true);
			offset += 4;
			let Moc: string;
			if (mocSize > -1) {
				Moc = this.ab2str(data.slice(offset, (offset += mocSize)));
			}

			const poseSize = view.getInt32(offset, true);
			offset += 4;
			let Pose: string;
			if (poseSize > -1) {
				Pose = this.ab2str(data.slice(offset, (offset += poseSize)));
			}

			const motionsStrSize = view.getInt32(offset, true);
			offset += 4;
			let motionsStr: string;
			let Motions: {
				[key: string]: {
					File: string;
					FadeInTime?: number;
					FadeOutTime?: number;
					Sound?: string;
				}[];
			};
			if (motionsStrSize > -1) {
				motionsStr = this.ab2str(data.slice(offset, (offset += motionsStrSize)));
				Motions = JSON.parse(motionsStr);
			}

			const physicsSize = view.getInt32(offset, true);
			offset += 4;
			let Physics: string;
			if (physicsSize > -1) {
				Physics = this.ab2str(data.slice(offset, (offset += physicsSize)));
			}

			const displayInfoSize = view.getInt32(offset, true);
			offset += 4;
			let DisplayInfo: string;
			if (displayInfoSize > -1) {
				DisplayInfo = this.ab2str(data.slice(offset, (offset += displayInfoSize)));
			}

			const userDataSize = view.getInt32(offset, true);
			offset += 4;
			let UserData: string;
			if (userDataSize > -1) {
				UserData = this.ab2str(data.slice(offset, (offset += userDataSize)));
			}

			const texturesSize = view.getInt32(offset, true);
			offset += 4;
			let Textures: string[];
			if (texturesSize > -1) {
				Textures = [];
				for (let index = 0; index < texturesSize; index++) {
					const textureSize = view.getInt32(offset, true);
					offset += 4;
					let Texture: string;
					if (textureSize > -1) {
						Texture = this.ab2str(data.slice(offset, (offset += textureSize)));
						Textures.push(Texture);
					}
				}
			}

			const expressionsSize = view.getInt32(offset, true);
			offset += 4;
			const Expressions: {
				FadeInTime: number;
				FadeOutTime: number;
				Name: string;
				File: string;
			}[] = [];
			if (expressionsSize > -1) {
				for (let index = 0; index < expressionsSize; index++) {
					offset += 4;
					const FadeInTime = view.getFloat64(offset, true);
					offset += 8;
					const FadeOutTime = view.getFloat64(offset, true);
					offset += 8;
					const nameSize = view.getInt32(offset, true);
					offset += 4;
					let Name: string;
					if (nameSize > -1) {
						Name = this.ab2str(data.slice(offset, (offset += nameSize)));
					}
					const fileSize = view.getInt32(offset, true);
					offset += 4;
					let File: string;
					if (fileSize > -1) {
						File = this.ab2str(data.slice(offset, (offset += fileSize)));
					}
					Expressions.push({
						FadeInTime,
						FadeOutTime,
						Name,
						File,
					});
				}
			}

			const groupsSize = view.getInt32(offset, true);
			offset += 4;
			let Groups: {
				Target: string;
				Name: string;
				Ids: string[];
			}[];
			if (groupsSize > -1) {
				Groups = [];
				for (let index = 0; index < groupsSize; index++) {
					offset += 4;
					const targetSize = view.getInt32(offset, true);
					offset += 4;
					let Target: string;
					if (targetSize > -1) {
						Target = this.ab2str(data.slice(offset, (offset += targetSize)));
					}
					const nameSize = view.getInt32(offset, true);
					offset += 4;
					let Name: string;
					if (nameSize > -1) {
						Name = this.ab2str(data.slice(offset, (offset += nameSize)));
					}
					const idsSize = view.getInt32(offset, true);
					offset += 4;
					let Ids: string[];
					if (idsSize > -1) {
						Ids = [];
						for (let index = 0; index < idsSize; index++) {
							const idSize = view.getInt32(offset, true);
							offset += 4;
							let Id: string;
							if (idSize > -1) {
								Id = this.ab2str(data.slice(offset, (offset += idSize)));
								Ids.push(Id);
							}
						}
					}
					Groups.push({
						Target,
						Name,
						Ids,
					});
				}
			}
			const hitAreasSize = view.getInt32(offset, true);
			offset += 4;
			let HitAreas: {
				Name: string;
				Id: string;
			}[];
			if (hitAreasSize > -1) {
				HitAreas = [];
				for (let index = 0; index < hitAreasSize; index++) {
					offset += 4;
					const nameSize = view.getInt32(offset, true);
					offset += 4;
					let Name: string;
					if (nameSize > -1) {
						Name = this.ab2str(data.slice(offset, (offset += nameSize)));
					}
					const idSize = view.getInt32(offset, true);
					offset += 4;
					let Id: string;
					if (idSize > -1) {
						Id = this.ab2str(data.slice(offset, (offset += idSize)));
					}
					HitAreas.push({
						Name,
						Id,
					});
				}
			}

			this.model3 = {
				Version,
				FileReferences: {
					Moc,
					Pose,
					Motions,
					Physics,
					DisplayInfo,
					UserData,
					Textures,
					Expressions,
				},
				Groups,
				HitAreas,
			};
		}

		if (offset < view.byteLength) {
			const cfgSize = view.getInt32(offset, true);
			offset += 4;
			if (cfgSize > -1) {
				this.cfgs = [];
				for (let index = 0; index < cfgSize; index++) {
					offset += 4;
					const fileNameSize = view.getInt32(offset, true);
					offset += 4;
					let fileName: string;
					if (fileNameSize > -1) {
						// eslint-disable-next-line @typescript-eslint/no-unused-vars
						fileName = this.ab2str(data.slice(offset, (offset += fileNameSize)));
						const fileSize = view.getInt32(offset, true);
						offset += 4;
						const file = data.slice(offset, (offset += fileSize));
						this.cfgs.push(file);
					}
				}
			}
		}

		if (offset < view.byteLength) {
			const cubismFilesSize = view.getInt32(offset, true);
			offset += 4;
			if (cubismFilesSize > -1) {
				for (let index = 0; index < cubismFilesSize; index++) {
					offset += 4;
					const fileNameSize = view.getInt32(offset, true);
					offset += 4;
					let fileName: string;
					if (fileNameSize > -1) {
						fileName = this.ab2str(data.slice(offset, (offset += fileNameSize)));
						const fileSize = view.getInt32(offset, true);
						offset += 4;
						const file = data.slice(offset, (offset += fileSize));
						if (fileName.endsWith('.motion3.json') && !fileName.startsWith('__MACOSX')) {
							const fileJson = JSON.parse(this.ab2str(file));
							this.motions.push(fileJson);
							if (!this.model3.FileReferences.Motions) {
								this.model3.FileReferences.Motions = { '': [] };
							}
							this.model3.FileReferences.Motions[Object.keys(this.model3.FileReferences.Motions)[0]].push({
								File: fileName,
							});
						} else if (fileName.endsWith('.exp3.json') && !fileName.startsWith('__MACOSX')) {
							const fileJson = JSON.parse(this.ab2str(file));
							this.exp3.push(fileJson);
							this.model3.FileReferences.Expressions.push({
								Name: fileName
									.split('/')
									.find(str => str.endsWith('.exp3.json'))
									.replace('.exp3.json', ''),
								File: fileName,
							});
						}
					}
				}
			}
		}
	}
}
