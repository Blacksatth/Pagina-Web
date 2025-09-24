declare module "react-modal" {
  import * as React from "react";

  export interface Props {
    isOpen: boolean;
    onRequestClose?: () => void;
    style?: any;
    className?: string;
    overlayClassName?: string;
    contentLabel?: string;
    ariaHideApp?: boolean;
    children?: React.ReactNode;
  }

  export default class Modal extends React.Component<Props> {}
}
