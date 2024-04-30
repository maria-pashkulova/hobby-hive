import { List, ListItem, Heading } from "@chakra-ui/react"
import { Link } from "react-router-dom"

const Sidebar = () => {
    return (

        <List spacing={4}>
            <ListItem >
                <Heading size='lg'>
                    <Link to='/'>
                        Хоби Кошер
                    </Link>
                </Heading>
            </ListItem>
            <ListItem >
                <Link to='/'>
                    Начало
                </Link>
            </ListItem>
            <ListItem >
                <Link to='/my-groups'>
                    Моите групи
                </Link>
            </ListItem>
            <ListItem >
                <Link to='/in-group'>
                    Изглед за една група
                </Link>
            </ListItem>
        </List>
    )
}

export default Sidebar
