import { useState, useEffect } from 'react'

import personsService from './services/persons'
import Notification from './components/Notification'

const Filter = ({ newFilter, handleFilterChange }) => (
  <div>
    filter shown with: <input value={newFilter} onChange={handleFilterChange} />
  </div>
)

const PersonForm = ({ newName, handleNameChange, newNumber, handleNumberChange, addPerson }) => (
  <form onSubmit={addPerson}>
    <div>
      name: <input value={newName} onChange={handleNameChange} />
    </div>
    <div>
      number: <input value={newNumber} onChange={handleNumberChange} />
    </div>
    <div>
      <button type="submit">add</button>
    </div>
  </form>
)

const Persons = ({ filteredPersons, deletePerson}) => (
  <div>
    {filteredPersons.map((person) => (
      <p key={person.name}>
        {person.name} {person.number}
        <button onClick={() => deletePerson(person.id)}>delete</button>
      </p>
    ))}
  </div>
)

const App = () => {
  const [persons, setPersons] = useState([])
  const [newName, setNewName] = useState('')
  const [newNumber, setNewNumber] = useState('')
  const [newFilter, setFilter] = useState('')
  const [successMessage, setSuccessMessage] = useState(null)
  const [errorMessage, setErrorMessage] = useState(null);

  useEffect(() => {
    personsService
      .getAll()
      .then(persons => setPersons(persons))
  }, [])

  const addPerson = (event) => {
    event.preventDefault()
    const existingPerson = persons.find(person => person.name === newName)
    if(existingPerson) {
      editNumber(existingPerson.id)
    }else{
      const newPerson = { name: newName, number: newNumber  }

      personsService
        .create(newPerson)
        .then(returnedPerson => {
          setPersons(persons.concat(returnedPerson))
          setSuccessMessage(`Added ${newPerson.name}`)
          setTimeout(() => {
            setSuccessMessage(null)
          }, 5000)
        })
        .catch((error) => {
          if (error.response && error.response.data && error.response.data.error) {
            setErrorMessage(error.response.data.error);
          } else {
            setErrorMessage('Error while adding the person');
          }
          setTimeout(() => {
            setErrorMessage(null);
          }, 5000);
          console.log(error);
        });
    }
    setNewName('')
    setNewNumber('')
  }

  const deletePerson = (id) => {
    const person = persons.find(person => person.id === id)
    const confirmation = window.confirm(`Delete ${person.name} ?`)

    if(confirmation){
      personsService
        .remove(id)
        .then(() => {
          setPersons(persons.filter(person => person.id !== id))
          setSuccessMessage(
            `Deleted ${person.name}`
          )
          setTimeout(() => {
            setSuccessMessage(null)
          }, 5000)
        })
        .catch(error => {
          console.log(error)
        })
    }
  }

  const editNumber = (id) => {
    const person = persons.find(person => person.id === id)
    const confirmation = window.confirm(`${person.name} is already added to phonebook, replace the old number with a new one?`)

    if(confirmation){
      const updatedPerson = { ...person, number: newNumber }

      personsService
        .update(id, updatedPerson)
        .then(returnedPerson => {
          setPersons(persons.map(person => person.id !== id ? person : returnedPerson))
          setSuccessMessage(
            `Updated ${updatedPerson.name}`
          )
          setTimeout(() => {
            setSuccessMessage(null)
          }, 5000)
        })
        .catch((error) => {
          setErrorMessage(`Information of ${person.name} has already been removed from server.`)
          setTimeout(() => {
            setErrorMessage(null)
          }, 5000)
          setPersons(persons.filter(person => person.id !== id))
          console.log(error)
        });
    }
  }

  const handleNameChange = (event) => {
    setNewName(event.target.value)
  }

  const handleNumberChange = (event) => {
    setNewNumber(event.target.value)
  }

  const handleFilterChange = (event) => {
    setFilter(event.target.value)
  }

  const filteredPersons = persons.filter((person) =>
    person.name.toLowerCase().includes(newFilter.toLowerCase())
  )

  return (
    <div>
      <h2>Phonebook</h2>
      <Notification message={successMessage} className="success"/>
      <Notification message={errorMessage} className="error" />
      <Filter filter={newFilter} handleFilterChange={handleFilterChange} />
      
      <h3>add a new</h3>

      <PersonForm 
        newName={newName} 
        handleNameChange={handleNameChange}
        newNumber={newNumber}
        handleNumberChange={handleNumberChange}
        addPerson={addPerson}
      />
      
      <h3>Numbers</h3>

      <Persons filteredPersons={filteredPersons} deletePerson={deletePerson} />  
    </div>
  )

}

export default App