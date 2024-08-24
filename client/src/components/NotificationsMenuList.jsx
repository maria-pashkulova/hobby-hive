import { Badge, Flex, Heading, Menu, MenuButton, MenuItem, MenuList, Tag, Text } from '@chakra-ui/react';
import { FiBell, FiX } from 'react-icons/fi';
import useNotifications from '../hooks/useNotifications';
import { Link } from 'react-router-dom';

const NotificationsMenuList = () => {

  const { notifications, notificationsCount, handleHideNotificationIndicator, handleMarkNotificationAsRead } = useNotifications();

  return (
    <Menu>
      <MenuButton
        p={2}
        borderRadius={4}
        m={2}
        _hover={{
          background: 'gray.100',
        }}
        position='relative'
        onClick={handleHideNotificationIndicator}
      >
        {notificationsCount !== 0 &&
          <Badge
            position='absolute'
            top="-10px"
            colorScheme="red"
            icon={<FiX />}
          >
            {notificationsCount}
          </Badge>

        }
        <FiBell />

      </MenuButton>
      <MenuList
        minW={'40vw'}
        maxW={'70vw'}
      >
        {!notifications.length ?
          (<MenuItem>Нямате нови известия</MenuItem>)
          :
          notifications.map((notification) =>
          (<MenuItem
            w={'100%'}
            as={Link}
            to={`/groups/${notification.fromGroup}/${notification.type === 'event'
              ? 'events'
              : notification.type === 'request'
                ? 'event-change-requests'
                : 'chat'
              }`}
            state={
              {
                isMemberFromNotification: notification.isMemberFromNotification,
                isGroupAdminFromNotifications: notification.isGroupAdminFromNotifications,
                eventStart: notification.eventStart
              }
            }
            key={notification.uniqueIdentifier}
            onClick={() => {
              handleMarkNotificationAsRead(notification.uniqueIdentifier);
            }}
          >

            <Flex
              p={3}
              w={'100%'}
              flexDir="column"
              flexWrap={'wrap'}
              borderLeftWidth={10}
              borderLeftRadius={3}
              borderColor={notification.notificationColor || 'blue.300'}
              gap={2}
              alignItems={'flex-start'} // so flex items won't stretch to fill flex container which is the default
            >
              <Heading as='h3' size='sm'>{notification.notificationAbout}</Heading>
              {notification.eventName && <Text fontStyle={'italic'}>{notification.eventName}</Text>}
              <Tag p={2} flexShrink='0' variant='outline'>
                Група: {notification.groupName}
              </Tag>
            </Flex>

          </MenuItem>)

          )
        }

      </MenuList>

    </Menu>
  )
}

export default NotificationsMenuList
