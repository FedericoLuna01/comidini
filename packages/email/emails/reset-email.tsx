import {
  Body,
  Button,
  Container,
  Head,
  Html,
  Img,
  Link,
  Preview,
  Section,
  Text,
} from '@react-email/components';

interface DropboxResetPasswordEmailProps {
  url: string;
  userFirstname?: string;
}

const baseUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : '';

export const ResetEmail = ({
  url,
  userFirstname,
}: DropboxResetPasswordEmailProps) => {
  return (
    <Html>
      <Head />
      <Body style={main}>
        <Preview>Restablecer tu contraseña</Preview>
        <Container style={container}>
          {/* CAMBIAR A LOGO */}
          <Img
            src={""}
            width="40"
            height="33"
            alt="Logo"
          />
          <Section>
            <Text style={text}>Hola {userFirstname},</Text>
            <Text style={text}>
              Alguien solicitó recientemente cambiar la contraseña de tu
              cuenta. Si fuiste tú, puedes establecer una nueva contraseña aquí:
            </Text>
            <Button style={button} href={url}>
              Restablecer contraseña
            </Button>
            <Text style={text}>
              Si no quieres cambiar tu contraseña o no solicitaste esto,
              simplemente ignora y elimina este mensaje.
            </Text>
            <Text style={text}>
              Para mantener tu cuenta segura, por favor no reenvíes este correo
              a nadie. Consulta nuestro Centro de Ayuda para{' '}
            </Text>
            <Text style={text}>¡Comiday te desea un buen día!</Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
};
export default ResetEmail;
const main = {
  backgroundColor: '#f6f9fc',
  padding: '10px 0',
};

const container = {
  backgroundColor: '#ffffff',
  border: '1px solid #f0f0f0',
  padding: '45px',
};

const text = {
  fontSize: '16px',
  fontFamily:
    "'Open Sans', 'HelveticaNeue-Light', 'Helvetica Neue Light', 'Helvetica Neue', Helvetica, Arial, 'Lucida Grande', sans-serif",
  fontWeight: '300',
  color: '#404040',
  lineHeight: '26px',
};

const button = {
  backgroundColor: '#007ee6',
  borderRadius: '4px',
  color: '#fff',
  fontFamily: "'Open Sans', 'Helvetica Neue', Arial",
  fontSize: '15px',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'block',
  width: '210px',
  padding: '14px 7px',
};

const anchor = {
  textDecoration: 'underline',
};
