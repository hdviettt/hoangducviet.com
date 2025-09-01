import Container from "@/components/Container";

const Footer = () => {
  return (
    <footer className="border-t bg-background">
      <Container className="py-8">
        <div className="flex flex-col md:flex-row justify-center items-center text-sm text-muted-foreground">
          <p>hoangducviet</p>
        </div>
      </Container>
    </footer>
  );
};

export default Footer;
