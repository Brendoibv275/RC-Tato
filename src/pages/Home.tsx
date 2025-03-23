import React from 'react';
import { Container, Typography, Box, Button, Grid, Card, CardContent, CardMedia, Chip, useTheme } from '@mui/material';
import { styled } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import { motion } from 'framer-motion';

const HeroSection = styled(Box)(({ theme }) => ({
  background: 'linear-gradient(rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.7)), url("/hero-bg.jpg")',
  backgroundSize: 'cover',
  backgroundPosition: 'center',
  height: '90vh',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  textAlign: 'center',
  color: 'white',
  position: 'relative',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'url("/pattern.png")',
    opacity: 0.1,
    pointerEvents: 'none',
  },
}));

const ServiceCard = styled(Card)(({ theme }) => ({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  backgroundColor: 'rgba(30, 30, 30, 0.8)',
  backdropFilter: 'blur(10px)',
  transition: 'all 0.3s ease-in-out',
  position: 'relative',
  overflow: 'hidden',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '4px',
    background: 'linear-gradient(90deg, #FF4D4D, #FF6B6B)',
  },
  '&:hover': {
    transform: 'translateY(-5px)',
    boxShadow: '0 8px 24px rgba(255, 77, 77, 0.2)',
  },
}));

const PromoBadge = styled(Box)(({ theme }) => ({
  position: 'absolute',
  top: 16,
  right: 16,
  backgroundColor: '#FF4D4D',
  color: 'white',
  padding: '8px 16px',
  borderRadius: '0',
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  zIndex: 2,
  boxShadow: '0 4px 8px rgba(255, 77, 77, 0.3)',
}));

const DecorativeLine = styled(Box)(({ theme }) => ({
  width: '60px',
  height: '4px',
  background: 'linear-gradient(90deg, #FF4D4D, transparent)',
  margin: '20px auto',
}));

const services = [
  {
    title: 'Tatuagens Minimalistas',
    description: 'Designs simples e elegantes que transmitem mensagens poderosas com traços sutis.',
    image: '/services/minimalist.jpg',
    price: 'R$ 50,00 individual',
    promo: '5 por R$ 150,00',
    isPromo: true,
  },
  {
    title: 'Cover-up',
    description: 'Transforme suas tatuagens antigas em novas obras de arte. Preço avaliado por trabalho.',
    image: '/services/cover-up.jpg',
    price: 'A partir de R$ 200',
    promo: 'Preço sob consulta',
    isPromo: false,
  },
  {
    title: 'Tatuagens Autorais',
    description: 'Designs exclusivos e personalizados, criados especialmente para você.',
    image: '/services/artistic.jpg',
    price: 'A partir de R$ 150',
    promo: 'Preço sob consulta',
    isPromo: false,
  },
];

const Home = () => {
  const navigate = useNavigate();
  const theme = useTheme();

  const handleSchedule = (serviceTitle: string) => {
    navigate('/schedule', { state: { service: serviceTitle } });
  };

  return (
    <Box>
      <HeroSection>
        <Container>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <Typography variant="h1" component="h1" gutterBottom sx={{ 
              textShadow: '2px 2px 4px rgba(0,0,0,0.5)',
              fontFamily: '"Playfair Display", serif',
              fontWeight: 700,
            }}>
              R7 Tattoo
            </Typography>
            <Typography variant="h5" gutterBottom sx={{ 
              textShadow: '1px 1px 2px rgba(0,0,0,0.5)',
              fontFamily: '"Playfair Display", serif',
              fontStyle: 'italic',
            }}>
              Arte em sua pele, estilo em seu corpo
            </Typography>
            <Button
              variant="contained"
              color="primary"
              size="large"
              onClick={() => navigate('/schedule')}
              sx={{ 
                mt: 4,
                px: 6,
                py: 2,
                fontSize: '1.1rem',
                fontFamily: '"Playfair Display", serif',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: '0 8px 16px rgba(255, 77, 77, 0.3)',
                },
              }}
            >
              Agende sua Tatuagem
            </Button>
          </motion.div>
        </Container>
      </HeroSection>
      
      <Container sx={{ py: 8 }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <Typography variant="h3" component="h2" gutterBottom align="center" sx={{ 
            fontFamily: '"Playfair Display", serif',
            fontWeight: 600,
          }}>
            Sobre Nós
          </Typography>
          <DecorativeLine />
          <Typography variant="body1" paragraph align="center" sx={{ 
            maxWidth: '800px',
            margin: '0 auto',
            fontSize: '1.1rem',
            lineHeight: 1.8,
          }}>
            Localizada na Avenida 03 do Conjunto Tambaú, Paço do Lumiar, Maranhão,
            a R7 Tattoo é referência em arte corporal. Nossa equipe especializada
            oferece serviços de alta qualidade, com foco em tatuagens em preto e cinza,
            trazendo vida e estilo para sua pele.
          </Typography>
        </motion.div>
      </Container>

      <Box sx={{ py: 8, bgcolor: 'background.paper', position: 'relative' }}>
        <Container>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <Typography variant="h3" component="h2" gutterBottom align="center" sx={{ 
              fontFamily: '"Playfair Display", serif',
              fontWeight: 600,
            }}>
              Nossos Serviços
            </Typography>
            <DecorativeLine />
            <Typography variant="h6" color="text.secondary" align="center" paragraph sx={{ 
              fontFamily: '"Playfair Display", serif',
              fontStyle: 'italic',
              mb: 6,
            }}>
              Descubra nossa variedade de estilos e técnicas de tatuagem
            </Typography>
            
            <Grid container spacing={4} sx={{ mt: 4 }}>
              {services.map((service, index) => (
                <Grid item key={index} xs={12} sm={6} md={4}>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 * index }}
                  >
                    <ServiceCard>
                      {service.isPromo && (
                        <PromoBadge>
                          <LocalOfferIcon />
                          <Typography variant="subtitle2">Promoção!</Typography>
                        </PromoBadge>
                      )}
                      <CardMedia
                        component="img"
                        height="250"
                        image={service.image}
                        alt={service.title}
                        sx={{ objectFit: 'cover' }}
                      />
                      <CardContent>
                        <Typography gutterBottom variant="h5" component="h2" sx={{ 
                          fontFamily: '"Playfair Display", serif',
                          fontWeight: 600,
                        }}>
                          {service.title}
                        </Typography>
                        <Typography paragraph sx={{ 
                          color: 'text.secondary',
                          lineHeight: 1.6,
                        }}>
                          {service.description}
                        </Typography>
                        <Box sx={{ mb: 2 }}>
                          <Typography variant="h6" color="primary" gutterBottom sx={{ 
                            fontFamily: '"Playfair Display", serif',
                            fontWeight: 600,
                          }}>
                            {service.price}
                          </Typography>
                          {service.promo && (
                            <Chip
                              label={service.promo}
                              color="primary"
                              size="small"
                              sx={{ 
                                mt: 1,
                                borderRadius: 0,
                                '& .MuiChip-label': {
                                  fontFamily: '"Playfair Display", serif',
                                },
                              }}
                            />
                          )}
                        </Box>
                        <Button 
                          variant="contained" 
                          color="primary" 
                          fullWidth
                          onClick={() => handleSchedule(service.title)}
                          sx={{ 
                            mt: 2,
                            py: 1.5,
                            fontFamily: '"Playfair Display", serif',
                            '&:hover': {
                              transform: 'translateY(-2px)',
                              boxShadow: '0 4px 8px rgba(255, 77, 77, 0.3)',
                            },
                          }}
                        >
                          Agendar
                        </Button>
                      </CardContent>
                    </ServiceCard>
                  </motion.div>
                </Grid>
              ))}
            </Grid>
          </motion.div>
        </Container>
      </Box>
    </Box>
  );
};

export default Home; 