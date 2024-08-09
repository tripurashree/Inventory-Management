'use client'

import { useState, useEffect } from 'react'
import { 
  Box, 
  Stack, 
  Typography, 
  Button, 
  Modal, 
  TextField, 
  Container, 
  Grid, 
  Card, 
  CardContent, 
  CardActions, 
  IconButton, 
  Tooltip,
  ThemeProvider,
  createTheme,
} from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import RemoveIcon from '@mui/icons-material/Remove'
import DeleteIcon from '@mui/icons-material/Delete'
import { firestore } from '@/firebase'
import {
  collection,
  doc,
  getDocs,
  query,
  setDoc,
  deleteDoc,
  getDoc,
} from 'firebase/firestore'

const theme = createTheme({
  palette: {
    primary: {
      main: '#007bff',
    },
    secondary: {
      main: '#28a745',
    },
    error: {
      main: '#dc3545',
    },
  },
})

const modalStyle = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'background.paper',
  borderRadius: 2,
  boxShadow: 24,
  p: 4,
}

const buttonStyle = {
  borderRadius: 2,
  padding: '12px 24px',
}

export default function Home() {
  const [inventory, setInventory] = useState([])
  const [open, setOpen] = useState(false)
  const [itemName, setItemName] = useState('')

  const updateInventory = async () => {
    const snapshot = query(collection(firestore, 'inventory'))
    const docs = await getDocs(snapshot)
    const inventoryList = []
    docs.forEach((doc) => {
      inventoryList.push({ name: doc.id, ...doc.data() })
    })
    setInventory(inventoryList)
  }

  useEffect(() => {
    updateInventory()
  }, [])

  const addItem = async (item) => {
    const docRef = doc(collection(firestore, 'inventory'), item)
    const docSnap = await getDoc(docRef)
    if (docSnap.exists()) {
      const { quantity } = docSnap.data()
      await setDoc(docRef, { quantity: quantity + 1 })
    } else {
      await setDoc(docRef, { quantity: 1 })
    }
    await updateInventory()
  }

  const removeItem = async (item) => {
    const docRef = doc(collection(firestore, 'inventory'), item)
    const docSnap = await getDoc(docRef)
    if (docSnap.exists()) {
      const { quantity } = docSnap.data()
      if (quantity === 1) {
        await deleteDoc(docRef)
      } else {
        await setDoc(docRef, { quantity: quantity - 1 })
      }
    }
    await updateInventory()
  }

  const increaseQuantity = async (item) => {
    const docRef = doc(collection(firestore, 'inventory'), item)
    const docSnap = await getDoc(docRef)
    if (docSnap.exists()) {
      const { quantity } = docSnap.data()
      await setDoc(docRef, { quantity: quantity + 1 })
    }
    await updateInventory()
  }

  const handleOpen = () => setOpen(true)
  const handleClose = () => setOpen(false)

  return (
    <ThemeProvider theme={theme}>
      <Container maxWidth="lg">
        <Box
          width="100%"
          minHeight="100vh"
          display="flex"
          flexDirection="column"
          alignItems="center"
          gap={4}
          py={4}
        >
          <Typography variant="h3" component="h1" gutterBottom>
            Inventory Management
          </Typography>

          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleOpen}
            sx={buttonStyle}
          >
            Add New Item
          </Button>

          <Grid container spacing={3}>
            {inventory.map(({ name, quantity }) => (
              <Grid item xs={12} sm={6} md={4} key={name}>
                <Card 
                  elevation={3} 
                  sx={{ 
                    transition: '0.3s', 
                    '&:hover': { transform: 'translateY(-5px)' } 
                  }}
                >
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      {name.charAt(0).toUpperCase() + name.slice(1)}
                    </Typography>
                    <Typography variant="body1">
                      Quantity: {quantity}
                    </Typography>
                  </CardContent>
                  <CardActions>
                    <Tooltip title="Decrease Quantity">
                      <IconButton onClick={() => removeItem(name)} color="error">
                        <RemoveIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Increase Quantity">
                      <IconButton onClick={() => increaseQuantity(name)} color="secondary">
                        <AddIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete Item">
                      <IconButton onClick={() => removeItem(name)} color="error">
                        <DeleteIcon />
                      </IconButton>
                    </Tooltip>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>
      </Container>

      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={modalStyle}>
          <Typography id="modal-modal-title" variant="h6" component="h2" gutterBottom>
            Add Item
          </Typography>
          <Stack width="100%" direction={'row'} spacing={2}>
            <TextField
              id="outlined-basic"
              label="Item"
              variant="outlined"
              fullWidth
              value={itemName}
              onChange={(e) => setItemName(e.target.value)}
            />
            <Button
              variant="contained"
              onClick={() => {
                addItem(itemName)
                setItemName('')
                handleClose()
              }}
              color="primary"
            >
              Add
            </Button>
          </Stack>
        </Box>
      </Modal>
    </ThemeProvider>
  )
}