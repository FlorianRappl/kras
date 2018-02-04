import * as React from 'react';
import { Nav, NavItem, NavLink, Navbar, NavbarBrand, NavbarToggler, Container, Row, Col, Collapse } from 'reactstrap';

export interface BasicConfig {
  name: string;
  version: string;
}

export interface LayoutProps {
  config: BasicConfig;
  children?: React.ReactNode;
}

export interface LayoutState {
  isOpen: boolean;
}

export class Layout extends React.Component<LayoutProps, LayoutState> {
  constructor(props: LayoutProps) {
    super(props);
    this.state = {
      isOpen: false,
    };
  }

  componentDidMount() {
    document.title = this.props.config.name;
  }

  private toggle = () => {
    const { isOpen } = this.state;
    this.setState({
      isOpen: !isOpen,
    });
  };

  render() {
    const { config, children } = this.props;
    const { name } = config;
    return (
      <div>
        <Navbar dark color="dark" expand="md">
          <NavbarBrand href="#/">{name}</NavbarBrand>
          <NavbarToggler onClick={this.toggle} />
          <Collapse isOpen={this.state.isOpen} navbar>
            <Nav className="ml-auto" navbar>
              <NavItem>
                <NavLink href="#/">Requests</NavLink>
              </NavItem>
              <NavItem>
                <NavLink href="#/broadcast">Broadcast</NavLink>
              </NavItem>
              <NavItem>
                <NavLink href="#/settings">Settings</NavLink>
              </NavItem>
              <NavItem>
                <NavLink href="#/injectors">Injectors</NavLink>
              </NavItem>
            </Nav>
          </Collapse>
        </Navbar>
        <Container fluid>
          {children}
        </Container>
      </div>
    );
  }
}
