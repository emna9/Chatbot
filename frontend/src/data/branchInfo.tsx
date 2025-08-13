import {
  CarOutlined,
  HeartOutlined,
  RocketOutlined,
  HomeOutlined,
  WarningOutlined,
  EditOutlined,
  FileSearchOutlined,
} from '@ant-design/icons';

export const BRANCH_INFO: Record<
  string,
  { icon: React.ReactNode; description: string }
> = {
  auto: {
    icon: <CarOutlined style={{ color: '#1890FF', fontSize: 48 }} />,
    description: "Questions sur votre assurance auto ? Je suis là pour vous aider.",
  },
  santé: {
    icon: <HeartOutlined style={{ color: '#eb2f96', fontSize: 48 }} />,
    description: "Besoin d’aide sur votre assurance santé ? Posez votre question.",
  },
  voyage: {
    icon: <RocketOutlined style={{ color: '#722ED1', fontSize: 48 }} />,
    description: "Des interrogations sur votre assurance voyage ? Demandez-moi.",
  },
  habitation: {
    icon: <HomeOutlined style={{ color: '#fa8c16', fontSize: 48 }} />,
    description: "Tout sur votre assurance habitation, posez votre question ici.",
  },
  vie: {
    icon: <WarningOutlined style={{ color: '#FF4D4F', fontSize: 48 }} />,
    description: "Votre assurance vie vous préoccupe ? Je peux vous répondre.",
  },
  pro: {
    icon: <EditOutlined style={{ color: '#9254de', fontSize: 48 }} />,
    description: "Des questions sur votre couverture professionnelle ?",
  },
  rc: {
    icon: <FileSearchOutlined style={{ color: '#13c2c2', fontSize: 48 }} />,
    description: "Je vous aide avec la responsabilité civile.",
  },
  général: {
    icon: (
      <img
        src="https://mdn.alipayobjects.com/huamei_iwk9zp/afts/img/A*s5sNRo5LjfQAAAAAAAAAAAAADgCCAQ/fmt.webp"
        alt="Bot Icon"
        style={{ width: 70, height: 75, marginBottom: 16 }}
      />
    ),
    description: "Comment puis-je vous aider aujourd’hui ?",
  },
};
