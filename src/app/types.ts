export interface ButtonGroupAction {
    type: 'button-group-action';
    icon: React.FC;
    action: () => void;
    hotkey: string;
}

interface ButtonGroupSpacer {
    type: 'button-group-spacer';
}

export type ButtonGroupElement = ButtonGroupAction | ButtonGroupSpacer;
