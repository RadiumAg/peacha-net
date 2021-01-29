export type CubismCDIJson = {
	Version: number;
	Parameters: {
		Id: string;
		GroupId: string;
		Name: string;
	}[];
	ParameterGroups: {
		Id: string;
		GroupId: string;
		Name: string;
	}[];
	Parts: {
		Id: string;
		Name: string;
	}[];
};

export type ExpressionParameter = {
	Id: string;
	Value: number;
	Blend: string;
};

export type CubismExpJson = {
	FadeInTime: number;
	FadeOutTime: number;
	Type: string;
	Parameters: ExpressionParameter[];
};

export type Curve = {
	Target: string;
	Id: string;
	FadeInTime?: number;
	FadeOutTime?: number;
	Segments: number[];
};

export type MotionUserData = {
	Time: number;
	Value: string;
};

export type CubismMotionJson = {
	Version: number;
	Meta: {
		Duration: number;
		Fps: number;
		Loop?: boolean;
		AreBeziersRestricted?: boolean;
		FadeInTime?: number;
		FadeOutTime?: number;
		CurveCount: number;
		TotalSegmentCount: number;
		TotalPointCount: number;
		UserDataCount?: number;
		TotalUserDataSize?: number;
	};
	Curves: Curve[];
	UserData?: MotionUserData[];
};

export type Vector2 = {
	X: number;
	Y: number;
};

export type EffectiveForce = {
	Gravity: Vector2;
	Wind: Vector2;
};

export type PhyscicsDictionaty = {
	Id: string;
	Name: string;
};

export type NormalizationValue = {
	Minimum: number;
	Maximum: number;
	Default: number;
};

export type Parameter = {
	Target: string;
	Id: string;
};

export type Input = {
	Source: Parameter;
	Weight: number;
	Type: string;
	Reflect: boolean;
};

export type Output = {
	Destination: Parameter;
	VertexIndex: number;
	Scale: number;
	Weight: number;
	Type: string;
	Reflect: boolean;
};

export type Vertex = {
	Position: Vector2;
	Mobility: number;
	Delay: number;
	Acceleration: number;
	Radius: number;
};

export type CubismPhysicsJson = {
	Version: number;
	Meta: {
		PhysicsSettingCount: number;
		TotalInputCount: number;
		TotalOutputCount: number;
		VertexCount: number;
		EffectiveForces: EffectiveForce;
		PhysicsDictionary: PhyscicsDictionaty[];
	};
	PhysicsSettings: {
		Id: string;
		Input: Input[];
		Output: Output[];
		Vertices: Vertex[];
		Normalization: {
			Position: NormalizationValue;
			Angle: NormalizationValue;
		};
	}[];
};

export type CubismPoseJson = {
	Type: string;
	FadeInTime?: number;
	Groups: {
		Id: string;
		Link?: string[];
	}[][];
};

export type UserData = {
	Target: string;
	Id: string;
	Value: string;
};

export type CubismUserDataJson = {
	Version: number;
	Meta: {
		UserDataCount: number;
		TotalUserDataSize: number;
	};
	UserData: UserData[];
};

export type CubismModelJson = {
	Version: number;
	FileReferences: {
		Moc: string;
		Textures: string[];
		Physics?: string;
		UserData?: string;
		Pose?: string;
		DisplayInfo?: string;
		Expressions?: {
			FadeInTime: number;
			FadeOutTime: number;
			Name: string;
			File: string;
		}[];
		Motions?: {
			[key: string]: {
				File: string;
				FadeInTime?: number;
				FadeOutTime?: number;
				Sound?: string;
			}[];
		};
	};
	Groups?: {
		Target: string;
		Name: string;
		Ids: string[];
	}[];
	HitAreas?: {
		Name: string;
		Id: string;
	}[];
	Layout?: {
		width: number;
		height: number;
		x: number;
		y: number;
		center_x: number;
		center_y: number;
		top: number;
		bottom: number;
		left: number;
		right: number;
	};
};
